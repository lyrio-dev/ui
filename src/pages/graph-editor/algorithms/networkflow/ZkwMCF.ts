import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";

class ZkwMCF extends GraphAlgorithm {
  // constructor() {
  //   super("ZkwMCF", "Zkw's algorithm for Minimum-Cost Network Flow");
  // }

  id() {
    return "zkw_mcf";
  }

  parameters(): ParameterDescriptor[] {
    return [
      {
        name: "source_vertex",
        parser: (text, graph) => parseRangedInt(text, 0, graph.nodes().length)
      },
      {
        name: "target_vertex",
        parser: (text, graph) => parseRangedInt(text, 0, graph.nodes().length)
      },
      {
        name: "flow_limit",
        parser: (text, _) => {
          if (text === undefined || text === "") return undefined;
          if (["inf", "infty", "infinity"].includes(text)) return Infinity;
          let res = Number(text);
          if (isNaN(res)) throw new Error(".input.error.nan");
          if (res < 0) throw new Error(".input.error.out_of_range");
          return res;
        }
      }
    ];
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;

  private dis: number[] = [];
  private vis: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  nodedatum = (i: number) => ({ dist: this.dis[i] });

  _valid(pos: number, e: _Edge): boolean {
    return !this.vis[e.to] && this.dis[pos] === this.dis[e.to] + e.cost && e.flow > 0;
  }

  is_valid(e: Edge): number {
    if (this.dis[e.source] === this.dis[e.target] + e.datum.cost) return 1;
    return 0;
  }

  report(): Graph {
    let rE = this.E.edges();
    rE.forEach((e) =>
      Object.assign(e.datum, {
        valid: this.is_valid(e)
      })
    );

    return new EdgeList(this.n, rE, this.nodedatum);
  }

  getStep(lineId: number): Step {
    return {
      graph: this.report(),
      codePosition: new Map<string, number>([["pseudo", lineId]])
    };
  }

  spfa(): boolean {
    this.clear(this.dis, Infinity);
    this.clear(this.vis, false);
    this.que.clear();

    this.dis[this.T] = 0;
    this.vis[this.T] = true;
    this.que.push(this.T);
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      this.vis[pos] = false;
      let e: _Edge, re: _Edge, tmp: number;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        e = this.E.edge[i];
        re = this.E.edge[i ^ 1];
        tmp = this.dis[pos] + re.cost;
        if (re.flow > 0 && this.dis[e.to] > tmp) {
          this.dis[e.to] = tmp;
          if (!this.vis[e.to]) {
            this.vis[e.to] = true;
            this.que.push(e.to);
          }
        }
      }
    }

    return this.dis[this.S] !== Infinity;
  }

  *dfs(pos: number, lim: number) {
    this.vis[pos] = true;
    if (pos === this.T) {
      // **for each** *augmenting path* ($\mathrm{P}_i$) in $\mathrm{SG}$ (using **DFS**)
      yield this.getStep(4);
      return lim;
    }
    let e: _Edge, re: _Edge;
    let res = 0;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      e = this.E.edge[i];
      re = this.E.edge[i ^ 1];
      if (this._valid(pos, e)) {
        e.mark = true;
        let tmp = yield* this.dfs(e.to, Math.min(lim, e.flow));
        (e.flow -= tmp), (re.flow += tmp);
        (lim -= tmp), (res += tmp);
        e.mark = false;
      }
      if (!lim) break;
    }
    return res;
  }

  *run(G: Graph, Spos: number, Tpos: number, limit: number = Infinity): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    // initialize the *weighted network flow graph*
    yield this.getStep(0);

    let flow = 0,
      cost = 0;
    while (limit > 0 && this.spfa()) {
      // find the *SSSP graph* ($\mathrm{SG}$) using **SPFA**, get the *minimum cost* ($cost$) from $\mathrm{S}$ to $\mathrm{T}$
      yield this.getStep(2);
      do {
        this.clear(this.vis, false);
        let delta = yield* this.dfs(this.S, limit);
        limit -= delta;
        flow += delta;
        cost += delta * this.dis[this.S];
        // increase <u>*maxflow*</u> by $sumlimit$, increase <u>*mincost*</u> by $sumlimit\cdot cost$, decrease *flow_limit* by $sumlimit$
        yield this.getStep(7);
      } while (this.vis[this.T]);
    }

    //console.log(`algo ZkwMCF : {flow: ${flow}, cost: ${cost}`);
    // **return** {<u>*maxflow*</u>, <u>*mincost*</u>}
    yield this.getStep(8);
    return { flow, cost };
  }
}

export { ZkwMCF };

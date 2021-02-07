import { GraphAlgorithm, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, min, max, _Edge } from "./Common";

class ZkwMCF extends GraphAlgorithm {
  constructor() {
    super("ZkwMCF", "Zkw‘s algorithm for Minimum-Cost Network Flow");
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
    rE.forEach((e, i) =>
      Object.assign(e.datum, {
        valid: this.is_valid(e)
      })
    );

    return new EdgeList(this.n, rE, this.nodedatum);
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
      // Yield before augment flow
      yield { graph: this.report() };
      return lim;
    }
    let e: _Edge, re: _Edge;
    let res = 0;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      e = this.E.edge[i];
      re = this.E.edge[i ^ 1];
      if (this._valid(pos, e)) {
        e.mark = true;
        let tmp = yield* this.dfs(e.to, min(lim, e.flow));
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

    let flow = 0,
      cost = 0;
    while (limit > 0 && this.spfa()) {
      do {
        this.clear(this.vis, false);
        let delta = yield* this.dfs(this.S, limit);
        limit -= delta;
        flow += delta;
        cost += delta * this.dis[this.S];

        // Yield after augment flow
        yield { graph: this.report() };
      } while (this.vis[this.T]);
    }

    console.log(`algo ZkwMCF : flow = ${flow} , cost = ${cost}`);
  }
}

export { ZkwMCF };

import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";

class MinCostFlow extends GraphAlgorithm {
  // constructor() {
  //   super("MinCostFlow", "classic algorithm for Minimum-Cost Network Flow");
  // }

  id() {
    return "classic_mcf";
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

  requiredParameter(): string[] {
    return ["source_vertex", "target_vertex", "flow_limit"];
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;

  private dis: number[] = [];
  private pre: number[] = [];
  private eid: number[] = [];
  private vis: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  nodedatum = (i: number) => ({ dist: this.dis[i] });

  is_valid(e: Edge, eid: number): number {
    if (this.dis[e.source] + this.E.edge[eid * 2].cost === this.dis[e.target]) return 1;
    return 0;
  }

  report(): Graph {
    let rE = this.E.edges();
    rE.forEach((e, i) =>
      Object.assign(e.datum, {
        valid: this.is_valid(e, i)
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
    this.clear(this.pre), this.clear(this.eid);
    this.clear(this.vis, false);
    this.que.clear();

    this.dis[this.S] = 0;
    this.vis[this.S] = true;
    this.que.push(this.S);
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      this.vis[pos] = false;
      let e: _Edge, tmp: number;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        e = this.E.edge[i];
        tmp = this.dis[pos] + e.cost;
        if (e.flow > 0 && this.dis[e.to] > tmp) {
          this.dis[e.to] = tmp;
          this.eid[e.to] = i;
          this.pre[e.to] = pos;
          if (!this.vis[e.to]) {
            this.vis[e.to] = true;
            this.que.push(e.to);
          }
        }
      }
    }

    return this.dis[this.T] !== Infinity;
  }

  *run(G: Graph, Spos: number, Tpos: number, limit: number = Infinity): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    // initialize the *weighted network flow graph*:
    yield this.getStep(0);

    let flow = 0,
      cost = 0;
    while (limit > 0 && this.spfa()) {
      let delta = limit;
      let e: _Edge;
      for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) {
        e = this.E.edge[this.eid[pos]];
        delta = Math.min(delta, e.flow);
        e.mark = true;
      }

      // find an *augmenting path* ($\mathrm{P}$) with *minimum total cost* ($cost$) using **SPFA**
      yield this.getStep(5);

      limit -= delta;
      flow += delta;
      cost += delta * this.dis[this.T];
      for (let pos = this.T; pos !== this.S; pos = this.pre[pos]) {
        this.E.edge[this.eid[pos]].flow -= delta;
        this.E.edge[this.eid[pos] ^ 1].flow += delta;
      }

      // update the *capacity* of **each** *edge* in $\mathrm{P}$ by $limit$
      yield this.getStep(7);
    }

    //console.log(`algo MinCostFlow : {flow: ${flow}, cost: ${cost}`);
    // **return** {<u>*maxflow*</u>, <u>*mincost*</u>}
    yield this.getStep(9);
    return { flow, cost };
  }
}

export { MinCostFlow };

/*
Reference:

int n,m,s,t;
int cnt=1,h[5005],fr[100005],to[100005],f[100005],w[100005];
void add(int a,int b,int c,int d) {
    fr[++cnt]=h[a];
    h[a]=cnt;
    to[cnt]=b;
    f[cnt]=c;
    w[cnt]=d;
}
int dis[5005],vis[5005],pre[5005],prn[5005];//分别表示spfa中当前每个点的距离标号，是否在队列中，每个点从哪条边、哪个点得到标号
bool spfa() {
    memset(dis,0x3f,sizeof(dis));
    memset(pre,0,sizeof(pre));
    memset(prn,0,sizeof(prn));
    dis[s]=0;
    queue<int>q;
    q.push(s);
    //spfa求最短路
    while(!q.empty()) {
        int x=q.top(),v=dis[x];q.pop();vis[x]=0;
        for(int i=h[x];i;i=fr[i]) {
            if(f[i]>0&&dis[to[i]]>v+w[i]) {
                dis[to[i]]=v+w[i];
                pre[to[i]]=i;
                prn[to[i]]=x;
                if(!vis[to[i]]) {
                	vis[to[i]]=1;
                	q.push(to[i]);
                }
            }
        }
    }
    return dis[t]!=dis[5004];
}
void mfmc() {
    int flow=0,ans=0;//最大流和费用
    while(spfa()) {
        int x=t,res=2e9;
        while(x!=s) {
            int i=pre[x];
            res=min(res,f[i]);
            x=prn[x];
        }//找出最短路的流量
        if(res==0)break;
        flow+=res;
        ans+=res*dis[t];
        x=t;
        while(x!=s) {
            int i=pre[x];
            f[i]-=res;
            f[i^1]+=res;
            x=prn[x];
        }//修改路径的容量
    }
    printf("%d %d",flow,ans);
}
*/

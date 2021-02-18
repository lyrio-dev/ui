import { GraphAlgorithm, ParameterDescriptor, parseRangedInt, Step } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";
import { NetworkFlowBase, _Edge } from "./Common";

class Dinic extends GraphAlgorithm {
  // constructor() {
  //   super("Dinic", "Dinic algorithm for Maximum Network Flow");
  // }

  id() {
    return "dinic_mf";
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
      }
    ];
  }

  private que: Queue<number> = new Queue<number>();

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;

  private dep: number[] = [];
  private cur: number[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  copy(dst: any[], src: any[], cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) dst[_] = src[_];
  }

  nodedatum = (i: number) => ({ depth: this.dep[i] });

  _valid(pos: number, e: _Edge): boolean {
    return this.dep[pos] === this.dep[e.to] + 1 && e.flow > 0;
  }

  is_valid(e: Edge, eid: number): number {
    if (this._valid(e.source, this.E.edge[eid * 2])) return 1;
    if (this._valid(e.target, this.E.edge[eid * 2 + 1])) return -1;
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

  bfs(): boolean {
    this.copy(this.cur, this.E.head);
    this.clear(this.dep);
    this.que.clear();

    this.que.push(this.T);
    this.dep[this.T] = 0;
    while (!this.que.empty()) {
      let pos = this.que.front();
      this.que.pop();
      if (pos === this.S) return true;
      let e: _Edge, re: _Edge;
      for (let i = this.E.head[pos]; i !== -1; i = e.next) {
        (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
        if (this.dep[e.to] === -1 && re.flow > 0) {
          this.dep[e.to] = this.dep[pos] + 1;
          this.que.push(e.to);
        }
      }
    }

    return false;
  }

  *dfs(pos: number, lim: number) {
    if (pos === this.T) {
      // **for each** *augmenting path* ($\mathrm{P}_i$) in $\mathrm{LG}$ (using **DFS**)
      yield this.getStep(3);
      return lim;
    }
    let e: _Edge, re: _Edge;
    let res = 0;
    for (let i = this.cur[pos]; i !== -1; this.cur[pos] = i = e.next) {
      (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
      e.mark = true;
      if (this._valid(pos, e)) {
        let tmp = yield* this.dfs(e.to, Math.min(lim, e.flow));
        (e.flow -= tmp), (re.flow += tmp);
        (lim -= tmp), (res += tmp);
      }
      e.mark = false;
      if (!lim) break;
    }
    return res;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    // initialize the *network flow graph*
    yield this.getStep(0);

    let flow = 0,
      delta = 0;
    while (this.bfs()) {
      // find the *level graph* ($\mathrm{LG}$) using **BFS**
      yield this.getStep(2);
      delta = yield* this.dfs(this.S, Infinity);
      flow += delta;
      // increase <u>*maxflow*</u> by the sum of **each** $limit_i$
      yield this.getStep(6);
    }

    //console.log(`algo Dinic : {flow: ${flow}}`);
    // **return** {<u>*maxflow*</u>}
    yield this.getStep(7);
    return { flow };
  }
}

export { Dinic };

/*
Reference:

int n,m,s,t;
int cnt=1,h[10005],fr[200005],to[200005],w[200005],r[10005];//r即当前弧优化中记录从哪条路开始还没搜过
void add(int x,int y,int z){
    fr[++cnt]=h[x];
    h[x]=cnt;
    to[cnt]=y;
    w[cnt]=z;
}
int dep[10005];//每个点在一次bfs后的深度
//分层，其实就是计算s到每个点的最短路
bool bfs(){
    memset(dep,-1,sizeof(dep));
    queue<int>q;
    dep[s]=0;
    q.push(s);
    while(!q.empty()){
        int now=q.front();
        q.pop();
        if(now==t)return 1;
        for(int i=h[now];i;i=fr[i]){
            if(w[i]>0&&dep[to[i]]==-1){
                dep[to[i]]=dep[now]+1;
                q.push(to[i]);
            }
        }
    }
    return 0;
}
int dfs(int x,int f){
    if(x==t)return f;
    int res=0;
    //因为当前弧优化，我们只搜还可能有价值的边
    for(int i=r[x];i;i=fr[i]){
    	r[x]=i;//记录一下这条边之前的边在重建前就不用再搜索了
        //与FF的区别：只能访问下一层的点
        if(w[i]>0&&dep[to[i]]==dep[x]+1){
            int c=dfs(to[i],min(w[i],f));
            if(c>0){
                w[i]-=c;
                w[i^1]+=c;
                f-=c;
                res+=c;
                //与FF的区别在于，这里并没有立即return c
                if(!f)return res;
            }
        }
    }
    return res;
}
int dinic(){
    int flow=0;
    while(bfs()){
    	for(int i=1;i<=n;i++)r[i]=h[i];
        flow+=dfs(s,2e9);//初始时从s开始，携带无穷大的流量进行dfs；也可以理解为类似FF算法的标号过程
    }
    return flow;
}
 */

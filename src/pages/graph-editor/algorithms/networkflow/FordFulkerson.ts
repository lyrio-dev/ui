import { GraphAlgorithm, Step, ParameterDescriptor, parseRangedInt } from "../../GraphAlgorithm";
import { Edge, EdgeList, Graph, Node } from "../../GraphStructure";
import { NetworkFlowBase, _Edge } from "./Common";

class FordFulkerson extends GraphAlgorithm {
  // constructor() {
  //   super("FordFulkerson", "Ford-Fulkerson algorithm for Maximum Network Flow");
  // }

  id() {
    return "ff_mf";
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

  private E: NetworkFlowBase;
  private V: Node[] = [];
  private n: number = 0;
  private S: number;
  private T: number;

  private visit: boolean[] = [];

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  getStep(lineId: number): Step {
    return {
      graph: new EdgeList(this.n, this.E.edges()),
      codePosition: new Map<string, number>([["pseudo", lineId]])
    };
  }

  *dfs(pos: number, lim: number) {
    this.visit[pos] = true;
    if (pos === this.T) {
      // find an *augmenting path* ($\mathrm{P}$) using **DFS**
      yield this.getStep(5);
      return lim;
    }
    let e: _Edge, re: _Edge;
    for (let i = this.E.head[pos]; i !== -1; i = e.next) {
      (e = this.E.edge[i]), (re = this.E.edge[i ^ 1]);
      e.mark = true;
      if (!this.visit[e.to] && e.flow > 0) {
        let res = yield* this.dfs(e.to, Math.min(lim, e.flow));
        if (res > 0) {
          (e.flow -= res), (re.flow += res);
          return res;
        }
      }
      e.mark = false;
    }
    return 0;
  }

  *run(G: Graph, Spos: number, Tpos: number): Generator<Step> {
    this.V = G.nodes();
    this.n = this.V.length;
    this.E = new NetworkFlowBase(G, this.n);
    (this.S = Spos), (this.T = Tpos);
    // initialize the *network flow graph*:
    yield this.getStep(0);

    let flow = 0,
      delta = 0;
    do {
      this.clear(this.visit, false);
      delta = yield* this.dfs(this.S, Infinity);
      flow += delta;
      // update the *capacity* of **each** *edge* in $\mathrm{P}$ by $limit$:
      yield this.getStep(7);
    } while (delta > 0);

    //console.log(`algo FordFulkerson : {flow: ${flow}}`);
    // **return** {<u>*maxflow*</u>}
    yield this.getStep(12);
    return { flow };
  }
}

export { FordFulkerson };

/*
Reference:

int n,m,s,t;
int h[205],fr[10005],to[10005],w[10005],cnt=1;//边表，w是容量
void add(int u,int v,int val){
	fr[++cnt]=h[u];
	h[u]=cnt;
	to[cnt]=v;
	w[cnt]=val;
}
int vis[10005];//表示每个点是否被标过号了
int dfs(int x,int delta)//x表示现在标到哪个点了，delta表示现在找到的s到x的容量 (即x将获得的标号)
{
	if(vis[x])return 0;//若被标过号了则不需重新标号
	vis[x]=1;//x现在会被标号
	if(x==t) return delta;//如果标到了t则开始增流
	for(int i=h[x];i;i=fr[i])//如果x不是t，则寻找下一个可以标号的点
	{
		if(w[i])//只有w[i]>0才能通过这条边标号(因为经过上面介绍过的转化思路我们把“向后边容量>0”这一条件转化为了反向边的容量)
		{
			int flow=dfs(to[i],min(delta,w[i]));//给to[i]标号
			if(flow>0)//说明找到了增流路径
			{
				w[i]-=flow;
				w[i^1]+=flow;//按我们的转化思路修正边的容量
				return flow;
			}
		}
	}
	return 0;//没有找到增流路径
}
int FF()
{
	int ans=0,delta=0;
	do{
		for(int i=1;i<=n;i++)vis[i]=0;//恢复到每个点都没被标号的状态
		delta=dfs(s,inf);//标号并增流，delta代表找到的增流路径增加了多少流量
		ans+=delta;
	}while(delta);//如果找不到增流路径就会退出
	return ans;
}
 */

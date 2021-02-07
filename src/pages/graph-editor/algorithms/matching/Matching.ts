import { GraphAlgorithm, Step } from "../../GraphAlgorithm";
import { AdjacencyList, hasMultipleEdges, hasSelfLoop, Edge, Graph, Node, NodeEdgeList } from "../../GraphStructure";
import { Queue } from "../../utils/DataStructure";

class Gabow extends GraphAlgorithm {
  constructor() {
    super("Gabow", "Gabow algorithm for Maximum Matching in General Graph");
  }

  private n: number = 0;
  private nodes: Node[] = [];
  private edges: Edge[] = [];
  private adjlist: AdjacencyList;

  private mark: number[] = [];
  private match: number[] = [];
  private label: number[] = [];
  private path: number[][] = [];
  private first: number[] = [];
  private visit: boolean[] = [];

  private que: Queue<number> = new Queue<number>();

  clear(buf: any[], val: any = -1, cnt: number = this.n) {
    for (let _ = 0; _ < cnt; ++_) buf[_] = val;
  }

  reverse(buf: any[], l: number = 0, r: number = buf.length) {
    for (let i = l, j = r - 1; i < j; ++i, --j) {
      let tmp = buf[i];
      (buf[i] = buf[j]), (buf[j] = tmp);
    }
  }

  gen1(p: number, x: number, z: number) {
    this.path[z] = [-1];
    this.path[z].push(z);
    this.path[z].push(this.match[z]);
    for (let i = 1; ; ++i) {
      this.path[z].push(this.path[x][i]);
      if (this.path[x][i] === p) break;
    }
  }

  gen2(p: number, y: number, z: number, t: number) {
    this.path[t] = [-1];
    for (let i = 1; ; ++i) {
      this.path[t].push(this.path[y][i]);
      if (this.path[y][i] === t) break;
    }
    this.reverse(this.path[t], 1);
    for (let i = 1; ; ++i) {
      this.path[t].push(this.path[z][i]);
      if (this.path[z][i] === p) break;
    }
  }

  is_matched(e: Edge): boolean {
    return this.match[e.source] === e.target;
  }

  is_marked(e: Edge): boolean {
    return this.mark[e.source] === e.target;
  }

  report(): NodeEdgeList {
    this.nodes.forEach((node, i) =>
      Object.assign(node.datum, {
        match: this.match[i],
        label: this.label[i],
        first: this.first[i]
      })
    );
    this.edges.forEach(edge =>
      Object.assign(edge.datum, {
        marked: this.is_marked(edge),
        matched: this.is_matched(edge)
      })
    );
    this.clear(this.mark);

    return new NodeEdgeList(this.nodes, this.edges);
  }

  *rematch(p: number, x: number, y: number) {
    this.path[x][0] = y;

    // path[x] is the augmenting path to be fliped

    for (let i = 0; ; ++i) {
      this.mark[this.path[x][i]] = this.path[x][i ^ 1];
      if (this.path[x][i] === p) break;
    }

    yield { graph: this.report() };

    for (let i = 0; ; ++i) {
      this.match[this.path[x][i]] = this.path[x][i ^ 1];
      if (this.path[x][i] === p) break;
    }
  }

  next(pos: number): number {
    return this.first[this.path[this.match[pos]][3]];
  }

  *check(pos: number) {
    this.clear(this.label, 0), this.clear(this.first);
    this.clear(this.path, []);
    this.que.clear();

    this.que.push(pos);
    (this.path[pos] = [-1]), this.path[pos].push(pos);
    this.label[pos] = 2;

    while (!this.que.empty()) {
      let x = this.que.front();
      this.que.pop();

      for (let e of this.adjlist.adjacentEdges(x)) {
        let y = e.target;
        if (this.label[y] === 0) {
          if (this.match[y] === -1) {
            // find an augmenting path
            yield* this.rematch(pos, x, y);
            return true;
          }
          let z = this.match[y];
          (this.label[y] = 1), (this.label[z] = 2);
          this.first[z] = y;
          this.que.push(z);
          this.gen1(pos, x, z);
        } else if (this.label[y] === 2) {
          if (this.first[x] === this.first[y]) continue;

          let t = -1;
          this.clear(this.visit, false);
          for (let j = this.first[x]; j !== -1; j = this.next(j)) this.visit[j] = true;
          for (let j = this.first[y]; j !== -1; j = this.next(j)) {
            if (this.visit[j]) {
              t = j;
              break;
            }
          }

          for (let j = this.first[x]; j !== t; j = this.next(j)) {
            this.gen2(pos, x, y, j);
            this.label[j] = 2;
            this.que.push(j);
            this.first[j] = t;
          }

          for (let j = this.first[y]; j !== t; j = this.next(j)) {
            this.gen2(pos, y, x, j);
            this.label[j] = 2;
            this.que.push(j);
            this.first[j] = t;
          }

          for (let j = 0; j < this.n; ++j)
            if (this.label[j] === 2 && this.label[this.first[j]] === 2) this.first[j] = t;
        }
      }
    }
    return false;
  }

  *run(graph: Graph): Generator<Step> {
    if (hasSelfLoop(graph)) throw new Error("algo Gabow : self loop");
    this.adjlist = AdjacencyList.from(graph, false);
    if (hasMultipleEdges(this.adjlist)) throw new Error("algo Gabow : mutiple edges");
    (this.edges = graph.edges()), (this.nodes = graph.nodes()), (this.n = this.nodes.length);

    let res = 0;
    this.clear(this.match), this.clear(this.mark);
    for (let i = 0; i < this.n; ++i) {
      if (this.match[i] === -1 && (yield* this.check(i))) ++res;

      yield { graph: this.report() };
    }

    console.log(`algo Gabow : {matched: ${res}}`);
    return { matched: res };
  }
}

export { Gabow };

/*
Reference:

void PROC_GEN1(int u,int x,int z){
  path[z][1] = z;
  path[z][2] = mate[z];
  for(int i = 1;;++i){
    path[z][i + 2] = path[x][i];
    if(path[x][i] == u) return;
  }
}//path(z)的第一个点为z，第二个点为mate(z)，其余部分为path(x)

void PROC_GEN2(int u,int y,int z,int p){
  int i,j;
  for(i = 1;;++i){
    path[p][i] = path[y][i];
    if(path[y][i] == p) break;
  }
  for(j = 1;j < i + 1 - j;++j) swap(path[p][j],path[p][i + 1 - j]);
  //先将y~p这一段路径拷贝下来，再翻转这条路径

  for(j = 1;;++j){
    path[p][j + i] = path[z][j];
    if(path[z][j] == u) return;
  }
}//path(p)的前半部分为path(y)的前半部分(从y到p这一段)的逆序，后半部分为path(z)

void PROC_REMATCH(int u,int x,int y){
  path[x][0] = y;//此时，path(x)下标从0开始，存放了一条从y到u的增广路
  for(int i = 0;;++i){
    mate[path[x][i]] = path[x][i ^ 1];
    //这一句的作用是将前述增广路中相邻两点进行配对
    //具体效果为:math[x][0]与math[x][1]配对，math[x][2]与math[x][3]配对……
    if(path[x][i] == u) return;
  }
}

bool PROC_FIND(int u){
  int i,j,x,y,z,join;
  for(i = 1;i <= n;++i) label[i] = path[i][0] = path[i][1] = path[i][2] = path[i][3] = first[i] = 0;
  h = t = 0;//以上为初始化
  queue[++t] = u;path[u][1] = u;label[u] = 2;
  while(h < t){//通过bfs搜索路径
    x = queue[++h];
    for(i = fir[x];i;i = e[i].nxt){
      y = e[i].to;//访问边(x,y)
      if(!label[y]){
        if(!mate[y]){//情况1：y是非饱和点
          PROC_REMATCH(u,x,y);//找到了增广路，立刻进行增广
          return 1;
        }
        //情况2：y是尚未被探索的饱和点
        //此时暂时将y置为奇点，并将与其配对的点z置为偶点
        label[y] = 1;
        z = mate[y];
        queue[++t] = z;label[z] = 2;first[z] = y;
        PROC_GEN1(u,x,z);//生成z到根的偶交互路
      }
      else if(label[y] == 2){//情况3：y是已被探索过的偶点，此时找到了一个树花
        if(first[x] == first[y]) continue;//这种情况下树花中不存在奇点，可以直接跳过
        join = 0;
        for(j = first[x];j;j = first[path[mate[j]][3]]) visit[j] = 1;
        for(j = first[y];j;j = first[path[mate[j]][3]]) if(visit[j]){
          join = j;break;
        }
        for(j = first[x];j;j = first[path[mate[j]][3]]) visit[j] = 0;
        //上述代码用于找到join
        //其原理为：从x开始，每次找到偶交互路上的下一个奇点并标记；
        //再从y开始每次找到偶交互路上的下一个奇点，找到的第一个被标记的点就是join

        //将x~join这一段路上原本的奇点修改为偶点，并生成其对应的偶交互路
        for(j = first[x];j != join;j = first[path[mate[j]][3]]){
          PROC_GEN2(u,x,y,j);
          label[j] = 2;queue[++t] = j;first[j] = join;
        }

        //将y~join这一段路上原本的奇点修改为偶点，并生成其对应的偶交互路
        for(j = first[y];j != join;j = first[path[mate[j]][3]]){
          PROC_GEN2(u,y,x,j);
          label[j] = 2;queue[++t] = j;first[j] = join;
        }

        //修改first的值：若某个偶点的first变成了偶点，就要改为join
        for(j = 1;j <= n;++j) if(label[j] == 2 && label[first[j]] == 2) first[j] = join;
      }
    }
  }
  return 0;
}
*/

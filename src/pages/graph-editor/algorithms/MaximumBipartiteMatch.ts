import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyList, BipartiteMatrix, Graph, Node, Edge, NodeEdgeList } from "../GraphStructure";

function max<type>(x: type, y: type): type {
  if (x >= y) return x;
  return y;
}

function min<type>(x: type, y: type): type {
  if (x <= y) return x;
  return y;
}

class Queue<type = any> {
  private values: type[] = [];
  private head: number = 0;
  private tail: number = 0;

  push(value: type) {
    this.tail = this.values.push(value);
  }

  empty(): boolean {
    return this.head == this.tail;
  }

  clear(): void {
    this.head = this.tail = 0;
    this.values = [];
  }

  front(): type {
    if (this.empty()) throw new Error("ds Queue : cannot query front() of an empty queue!");
    return this.values[this.head];
  }

  pop() {
    if (this.empty()) throw new Error("ds Queue : cannot pop() from an empty queue!");
    ++this.head;
  }

  size(): number {
    return this.tail - this.head;
  }
}

class KuhnMunkres extends GraphAlgorithm {
  constructor() {
    super("KuhnMunkres Algorithm", "Kuhn-Munkres algorithm for Maximum Bipartite Graph Match");
  }

  private que: Queue<number> = new Queue<number>();

  private n: number = 0;
  private w: number[][] = [];
  private lx: number[] = [];
  private ly: number[] = [];
  private inS: boolean[] = [];
  private inT: boolean[] = [];
  private matchx: number[] = [];
  private matchy: number[] = [];
  private slackv: number[] = [];
  private slackx: number[] = [];

  addToS(x: number) {
    this.que.push(x);
    this.inS[x] = true;
    for (let y = 0; y < this.n; ++y) {
      let tmp: number = this.lx[x] + this.ly[y] - this.w[x][y];
      if (tmp < this.slackv[y]) {
        this.slackv[y] = tmp;
        this.slackx[y] = x;
      }
    }
  }

  flip(y: number) {
    if (this.matchx[this.slackx[y]] !== -1) this.flip(this.matchx[this.slackx[y]]);
    this.matchy[y] = this.slackx[y], this.matchx[this.slackx[y]] = y;
  }

  assert() {
    for (let x = 0; x < this.n; ++x)
      for (let y = 0; y < this.n; ++y)
        if (this.lx[x] + this.ly[y] < this.w[x][y])
          throw new Error(`algo KM : assertion failed (x = ${x}, y = ${y})`);
  }

  valid(x: number, y: number): boolean {
    return this.lx[x] + this.ly[y] == this.w[x][y];
  }

  extand(): boolean {
    while (!this.que.empty()) {
      let x = this.que.front();
      this.que.pop();
      for (let y = 0; y < this.n; ++y) {
        if (!this.valid(x, y) || this.inT[y]) continue;
        this.inT[y] = true;
        this.slackx[y] = x;
        if (this.matchy[y] === -1) {
          this.flip(y);
          return true;
        }
        if (!this.inS[this.matchy[y]])
          this.addToS(this.matchy[y]);
      }
    }
    return false;
  }

  is_matched(e: Edge): boolean {
    return this.matchx[e.source] === e.target - this.n;
  }

  report(base: BipartiteMatrix): NodeEdgeList {
    let X = base.leftSide;
    let Y = base.rightSide;
    let edges = base.edges();
    edges.forEach(e => Object.assign(e.datum, { matched: this.is_matched(e) }));
    X.forEach((n, i) => Object.assign(n.datum, { match: this.matchx[i], in: this.inS[i], l: this.lx[i] }));
    Y.forEach((n, i) => Object.assign(n.datum, { match: this.matchy[i], in: this.inT[i], l: this.ly[i] }));

    return new NodeEdgeList(X.concat(Y), edges);
  }

  * run(graph: Graph): Generator<Step> {
    if (!(graph instanceof BipartiteMatrix)) throw new Error();
    this.n = graph.mat.length;
    if (this.n !== graph.mat[0].length) throw new Error("|X| != |Y|");
    this.w = graph.mat;
    this.lx = Array.from({ length: this.n }, (_, x) => {
      let res = -Infinity;
      for (let y = 0; y < this.n; ++y)
        res = max(res, this.w[x][y]);
      return res;
    });
    this.ly = Array.from({ length: this.n }, () => 0);


    for (let i = 0; i < this.n; ++i) {
      this.matchx[i] = this.matchy[i] = -1;
    }

    for (let x = 0; x < this.n; ++x) {
      for (let i = 0; i < this.n; ++i) {
        this.slackx[i] = -1, this.slackv[i] = Infinity;
        this.inS[i] = this.inT[i] = false;
      }
      this.que.clear();
      this.addToS(x);
      while (!this.extand()) {
        let delta: number = Infinity;
        for (let y = 0; y < this.n; ++y)
          if (!this.inT[y])
            delta = min(delta, this.slackv[y]);
        for (let i = 0; i < this.n; ++i) {
          if (this.inS[i]) this.lx[i] -= delta;
          if (this.inT[i]) this.ly[i] += delta;
          else this.slackv[i] -= delta;
        }
        this.assert();
        let break_flag: boolean = false;
        for (let y = 0; y < this.n; ++y) {
          if (!this.inT[y] && this.slackv[y] === 0) {
            this.inT[y] = true;
            if (this.matchy[y] === -1) {
              this.flip(y);
              break_flag = true;
              break;
            }
            this.addToS(this.matchy[y]);
          }
        }
        if (break_flag) break;
      }

      // Yeild Step
      yield { graph: this.report(graph) };
    }

    // let adjlist = AdjacencyList.from(graph, false);
    // let nodes = graph.nodes(),
    //     edges = graph.edges(),
    //     nc = nodes.length;
    // let left = graph.leftSide,
    //     right = graph.rightSide;
    // nodes.forEach(node => Object.assign(node.datum, { tag: 0, match: -1 }));
    // edges.map(edge =>
    //     nodes[edge.source].datum.side === "left"
    //         ? edge
    //         : {
    //             source: edge.target,
    //             target: edge.source,
    //             datum: edge.datum
    //         }
    // );
    //
    // for (let leftNode of left) {
    //     edges.forEach(edge => (edge.datum.matched = nodes[edge.source].datum.match === edge.target));
    //     yield { graph: new NodeEdgeList(nodes, edges) };
    //
    //     right.forEach(node => (node.datum.visited = false));
    //     if (!this.dfs(leftNode, adjlist)) {
    //         leftNode.datum.tag = 2;
    //     }
    // }
  }
}

export { KuhnMunkres };

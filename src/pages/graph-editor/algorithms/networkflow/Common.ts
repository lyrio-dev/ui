import { Graph, Edge, hasSelfLoop } from "../../GraphStructure";

export class _Edge {
  public mark: boolean = false;

  constructor(public to: number, public next: number, public flow: number, public cost?: number) {}
}

export class NetworkFlowBase {
  head: number[] = [];
  edge: _Edge[] = [];
  _edges: Edge[] = [];

  addedge(to: number, next: number, flow: number, cost?: number): number {
    return this.edge.push(new _Edge(to, next, flow, cost)) - 1;
  }

  constructor(G: Graph, n: number) {
    if (hasSelfLoop(G)) throw new Error("algo networkflow : self loop");
    for (let i = 0; i < n; ++i) this.head[i] = -1;
    this._edges = G.edges();
    this._edges.forEach(({ source: s, target: t, datum: d }) => {
      this.head[s] = this.addedge(t, this.head[s], d.flow, d.cost);
      this.head[t] = this.addedge(s, this.head[t], 0, -d.cost);
    });
  }

  edges(): Edge[] {
    this._edges.forEach((e, i) =>
      Object.assign(e.datum, {
        used: this.edge[i * 2 + 1].flow,
        mark: this.edge[i * 2].mark ? 1 : this.edge[i * 2 + 1].mark ? -1 : 0
      })
    );
    this.edge.forEach(e => (e.mark = false));
    return this._edges;
  }
}

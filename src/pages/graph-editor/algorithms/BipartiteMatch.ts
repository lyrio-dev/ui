import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyList, BipartiteGraph, Edge, Graph, Node, NodeEdgeList } from "../GraphStructure";

class HungarianDFS extends GraphAlgorithm {
  constructor() {
    super("HungarianDFS", "DFS version of Hungarian algorithm for Bipartite Graph Match");
  }

  private edges: Edge[] = [];
  private nodes: Node[] = [];
  private adjlist: AdjacencyList;

  *dfs(pos: number) {
    let sn = this.nodes[pos],
      sd = sn.datum;
    for (let e of this.adjlist.adjacentEdges(sn.id)) {
      let tn = this.nodes[e.target],
        td = tn.datum;
      if (!td.visit) {
        td.visit = true;
        (td.mark = sn.id), (sd.mark = tn.id);
        if (td.match === -1 || (yield* this.dfs(td.match))) {
          if (td.match === -1) {
            this.edges.forEach(edge => (edge.datum.matched = this.nodes[edge.source].datum.match === edge.target));
            this.edges.forEach(edge => (edge.datum.marked = this.nodes[edge.source].datum.mark === edge.target));
            yield { graph: new NodeEdgeList(this.nodes, this.edges) };
          }
          (td.match = sn.id), (sd.match = tn.id), (td.tag = sd.tag = 1);
          return true;
        }
        td.mark = sd.mark = -1;
      }
    }
  }

  *run(graph: Graph): Generator<Step> {
    if (!(graph instanceof BipartiteGraph)) throw new Error();
    this.adjlist = AdjacencyList.from(graph, false);
    this.nodes = graph.nodes();
    this.edges = graph.edges();
    let left = graph.leftSide,
      right = graph.rightSide;
    this.nodes.forEach(node => Object.assign(node.datum, { tag: 0, match: -1, mark: -1 }));
    this.edges.map(edge =>
      this.nodes[edge.source].datum.side === "left"
        ? edge
        : {
            source: edge.target,
            target: edge.source,
            datum: edge.datum
          }
    );
    this.edges.forEach(e => Object.assign(e.datum, { marked: false, matched: false }));

    for (let leftnode of left) {
      right.forEach(rightnode => (this.nodes[rightnode.id].datum.visit = false));
      this.nodes.forEach(node => (node.datum.mark = -1));
      if (!(yield* this.dfs(leftnode.id))) this.nodes[leftnode.id].datum.tag = 2;

      this.edges.forEach(edge => (edge.datum.matched = this.nodes[edge.source].datum.match === edge.target));
      this.edges.forEach(edge => (edge.datum.marked = false));
      yield { graph: new NodeEdgeList(this.nodes, this.edges) };
    }
  }
}

export { HungarianDFS };

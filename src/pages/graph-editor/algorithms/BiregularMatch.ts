import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyList, BipartiteGraph, Graph, Node, NodeEdgeList } from "../GraphStructure";

class HungarianDFS extends GraphAlgorithm {
  constructor() {
    super("HungarianDFS", "DFS version of Hungarian algorithm for Biregular Graph Match");
  }

  dfs(node: Node, edges: AdjacencyList): boolean {
    return edges.adjacentEdges(node.id).some(({ target: t }) => {
      let tn = edges.nodes()[t], td = tn.datum;
      if (!td.visit) {
        td.visit = true;
        if (td.match === -1 || this.dfs(edges.nodes()[td.match], edges)) {
          td.match = node.id;
          node.datum.match = tn.id;
          td.tag = node.datum.tag = 1;
          return true;
        }
      }
    });
  }

  * run(graph: Graph): Generator<Step> {
    if (!(graph instanceof BipartiteGraph)) throw new Error();
    let adjlist = AdjacencyList.from(graph, false);
    let nodes = graph.nodes(), edges = graph.edges(), nc = nodes.length;
    let left = graph.leftSide, right = graph.rightSide;
    nodes.forEach(node => Object.assign(node.datum, { tag: 0, match: -1 }));
    edges.map(edge => nodes[edge.source].datum.side === "left" ? edge : ({
      source: edge.target,
      target: edge.source,
      datum: edge.datum
    }));

    for (let leftNode of left) {
      edges.forEach(edge => edge.datum.matched = nodes[edge.source].datum.match === edge.target);
      yield { graph: new NodeEdgeList(nodes, edges) };

      right.forEach(node => node.datum.visited = false);
      if (!this.dfs(leftNode, adjlist)) {
        leftNode.datum.tag = 2;
      }
    }
  }
}

export { HungarianDFS };
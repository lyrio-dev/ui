import { DFSNodeDatum, DFS } from "./DFS";
import { Graph, WeightedEdgeDatum } from "../GraphStructure";

test("dfs", () => {
  let mat = [
    [0, 1, 1, 1, 0],
    [6, 0, 2, 2, 0],
    [0, 3, 0, 9, 0],
    [3, 0, 7, 0, 8],
    [0, 5, 0, 0, 0]
  ];
  let graph = Graph.fromAdjacencyMatrix(mat, true, true, undefined, v => new WeightedEdgeDatum(v));
  let dfs = new DFS();
  if (graph === null)
    throw new Error();
  else {
    let steps = Array
      .from(dfs.run(graph, 0))
      .map(s => s.graph.getNodeList())
      .map(nl => nl.map(n => n.datum?.dist));
    console.table(steps);
  }
});
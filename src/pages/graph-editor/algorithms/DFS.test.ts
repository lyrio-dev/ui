import { DFS } from "./DFS";
import { Graph } from "../GraphStructure";

test("dfs", () => {
  let mat = [
    [0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1],
    [0, 1, 0, 0, 0]
  ];
  let graph = Graph.fromAdjacencyMatrix(mat, true, false, i => i, v => v);
  let dfs = new DFS();
  if (graph === null)
    throw new Error();
  else {
    let steps = Array
      .from(dfs.run(graph, 0))
      .map(s => s.graph.getNodeList())
      .map(nl => nl.map(n => n.datum?.sequence));
    console.table(steps);
  }
});

import { BFS } from "./BFS";
import { Graph } from "../GraphStructure";

test("bfs", () => {
  let mat = [
    [0, 1, 1, 0, 1],
    [0, 0, 1, 1, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1],
    [1, 1, 0, 0, 0]
  ];
  let graph = Graph.fromAdjacencyMatrix(
    mat,
    true,
    false,
    i => i,
    v => v
  );
  let bfs = new BFS();
  if (graph === null) throw new Error();
  else {
    let steps = Array.from(bfs.run(graph, 0))
      .map(s => s.graph.getNodeList())
      .map(nl => nl.map(n => n.datum?.dist));
    console.table(steps);
  }
});

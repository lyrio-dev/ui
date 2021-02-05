import { Dijkstra } from "./Dijkstra";
import { AdjacencyMatrix } from "../GraphStructure";

test("Dijkstra", () => {
  let mat = [
    [0, 7, 1, 0, 0, 0],
    [0, 0, 0, 4, 0, 1],
    [0, 6, 0, 0, 2, 7],
    [0, 0, 0, 0, 0, 0],
    [0, 3, 0, 5, 0, 0],
    [0, 0, 0, 0, 3, 0]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let res: number[][] = [];
  for (let step of new Dijkstra().run(graph, 0)) {
    res.push(step.graph.nodes().map(n => n.datum.dist));
  }
  console.table(res);
});

import { Prim } from "./Prim";
import { AdjacencyMatrix } from "../GraphStructure";

test("CriticalPath", () => {
  let mat = [
    [0, 15, 0, 40, 25],
    [15, 0, 30, 20, 30],
    [0, 30, 0, 10, 15],
    [40, 20, 10, 0, 10],
    [25, 30, 15, 10, 0]
  ];
  let graph = new AdjacencyMatrix(mat, false);
  let res = [];
  for (let step of new Prim().run(graph)) {
    res.push(step.graph.edges().map(e => e.source + ", " + e.target + ", " + e.datum.chosen));
  }
  console.table(res);
});

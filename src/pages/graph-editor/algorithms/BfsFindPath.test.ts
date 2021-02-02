import { BfsFindPath } from "./BfsFindPath";
import { AdjacencyMatrix } from "../GraphStructure";

test("BfsFindPath", () => {
  let mat = [
    [0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1],
    [0, 1, 0, 0, 0]
  ].map(line => line.map(e => (e === 1 ? {} : undefined)));
  let graph = new AdjacencyMatrix(mat, true);
  let res: number[][] = [];
  for (let step of new BfsFindPath().run(graph, 0)) {
    res.push(step.graph.nodes().map(n => n.datum.dist));
  }
  console.table(res);
});

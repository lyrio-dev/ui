import { DfsFindPath } from "./DfsFindPath";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

test("DfsFindPath", () => {
  let mat = [
    [0, 0, 0, 0, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 1, 0, 0, 1],
    [0, 1, 0, 0, 0]
  ].map(line => line.map(e => e === 1 ? ({}) : undefined));
  let graph = new AdjacencyMatrix(mat, true);
  let res: number[][] = [];
  for (let step of new DfsFindPath().run(graph, 0)) {
    res.push(step.graph.nodes().map(n => n.datum.sequence));
  }
  console.table(res);
});

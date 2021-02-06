import { SalesmanPath } from "./TravelingSalesmanProb";
import { AdjacencyMatrix } from "../GraphStructure";

test("SalesmanPath", () => {
  let mat = [
    [0, 10, 10, 9, 4],
    [0, 0, 13, 4, 20],
    [0, 0, 0, 11, 3],
    [0, 0, 0, 0, 16],
    [0, 0, 0, 0, 0]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let output = [];
  for (let step of new SalesmanPath().run(graph)) {
    let tmp = [];
    step.graph.edges().forEach(e => {
      if (e.datum.chosen == 1) {
        tmp.push([e.source + 1, e.target + 1]);
      }
    });
    tmp.push(step.answer);
    output.push(tmp);
  }
  console.table(output);
});

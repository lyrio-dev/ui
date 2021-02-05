import { SalesmanCheaperAlgo } from "./salesmanCheaperAlgo";
import { AdjacencyMatrix } from "../GraphStructure";
import { timeStamp } from "console";

test("SalesmanCheaperAlgo", () => {
  let mat = [
    [0, 18, 35, 25, 27],
    [18, 0, 23, 21, 19],
    [35, 23, 0, 17, 28],
    [25, 21, 17, 0, 24],
    [27, 19, 28, 24, 0]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let output = [];
  for (let step of new SalesmanCheaperAlgo().run(graph)) {
    let tmp = [];
    step.graph.edges().forEach(e => {
      if (e.datum.chosen == 1) {
        tmp.push([e.source + 1, e.target + 1]);
      }
    });
    while (tmp.length < graph.nodes().length) {
      tmp.push("/");
    }
    tmp.push(step.answer);
    output.push(tmp);
  }
  console.table(output);
});

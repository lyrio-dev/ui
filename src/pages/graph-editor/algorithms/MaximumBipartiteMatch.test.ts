import { KuhnMunkres } from "./MaximumBipartiteMatch";
import { BipartiteMatrix } from "../GraphStructure";

test("KuhnMunkres", () => {
  let mat = [
    [3, 4, 6, 4, 9],
    [6, 4, 5, 3, 8],
    [7, 5, 3, 4, 2],
    [6, 3, 2, 2, 5],
    [8, 4, 5, 4, 7]
  ].map(line => line.map(w => ({ weight: w })));
  let graph = new BipartiteMatrix(mat);
  let res: number[][] = [];
  let resNode: any[][] = [];
  let resEdge: any[][] = [];
  for (let step of new KuhnMunkres().run(graph)) {
    res.push(step.graph.nodes().map(n => n.datum.match));
    resNode.push(step.graph.nodes().map(n => (
      n.datum.l
    )));
    resEdge.push(step.graph.edges().map(e => (
      (e.datum.valid ? "v" : " ") +
      (e.datum.marked ? "m" : " ") +
      (e.datum.matched ? "M" : " ")
    )));
  }
  console.table(res);
  console.table(resNode);
  console.table(resEdge);
});

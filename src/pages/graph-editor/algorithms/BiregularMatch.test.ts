import { HungarianDFS } from "./BiregularMatch";
import { BipartiteGraph } from "../GraphStructure";

test("HungarianDFS", () => {
  let edges = [
    [0, 6], [0, 8], [1, 9], [1, 11], [2, 7], [2, 9], [3, 10], [4, 10], [4, 11], [5, 11]
  ].map(([s, t]) => ({ source: s, target: t, datum: {} }));
  let graph = new BipartiteGraph(6, 6, edges);
  let res: number[][] = [];
  for (let step of new HungarianDFS().run(graph)) {
    res.push(step.graph.nodes().map(n => n.datum.match));
  }
  console.table(res);
});
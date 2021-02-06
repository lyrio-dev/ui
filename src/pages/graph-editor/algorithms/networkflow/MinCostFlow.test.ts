import { MinCostFlow } from "./MinCostFlow";
import { EdgeList } from "../../GraphStructure";

let edges = [
  [0, 1, 1, 2],
  [0, 2, 4, 6],
  [1, 2, 1, 2],
  [1, 3, 4, 6],
  [2, 3, 1, 2]
].map(([s, t, f, c]) => ({ source: s, target: t, datum: { flow: f, cost: c } }));
let graph = new EdgeList(4, edges);
let Spos = 0,
  Tpos = 3,
  limit = Infinity;

test("MinCostFlow", () => {
  let resEdge: any[][] = [];
  let res: number[][] = [];
  for (let step of new MinCostFlow().run(graph, Spos, Tpos, limit)) {
    res.push(step.graph.nodes().map(n => n.datum.dist));
    resEdge.push(step.graph.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.table(res);
  console.table(resEdge);
});

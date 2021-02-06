import { FordFulkerson } from "./FordFulkerson";
import { EdmondsKarp } from "./EdmondsKarp";
import { Dinic } from "./Dinic";
import { EdgeList } from "../../GraphStructure";

// let edges = [
//   [0,1,3],
//   [0,3,4],
//   [1,2,4],
//   [1,3,5],
//   [1,4,1],
//   [2,5,2],
//   [3,2,1],
//   [3,4,2],
//   [4,2,3],
//   [4,5,6]
// ].map(([s, t, f]) => ({ source: s, target: t, datum: {flow: f} }));
// let graph = new EdgeList(6, edges);
let edges = [
  [0, 1, 1],
  [0, 3, 1],
  [1, 4, 1],
  [2, 5, 1],
  [3, 2, 1],
  [3, 4, 1],
  [4, 5, 1]
].map(([s, t, f]) => ({ source: s, target: t, datum: { flow: f } }));
let graph = new EdgeList(6, edges);
let Spos = 0,
  Tpos = 5;

test("FordFulkerson", () => {
  let resEdge: any[][] = [];
  for (let step of new FordFulkerson().run(graph, Spos, Tpos)) {
    resEdge.push(step.graph.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.table(resEdge);
});

test("EdmondsKarp", () => {
  let resEdge: any[][] = [];
  for (let step of new EdmondsKarp().run(graph, Spos, Tpos)) {
    resEdge.push(step.graph.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.table(resEdge);
});

test("Dinic", () => {
  let resEdge: any[][] = [];
  let res: number[][] = [];
  for (let step of new Dinic().run(graph, Spos, Tpos)) {
    res.push(step.graph.nodes().map(n => n.datum.depth));
    resEdge.push(step.graph.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.table(res);
  console.table(resEdge);
});

import { FordFulkerson } from "./FordFulkerson";
import { EdmondsKarp } from "./EdmondsKarp";
import { Dinic } from "./Dinic";
import { EdgeList } from "../../GraphStructure";

import { graph, Tpos, Spos, limit } from "./LargeGraph.data";
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

// let edges = [
//   [0, 1, 1],
//   [0, 3, 1],
//   [1, 4, 1],
//   [2, 5, 1],
//   [3, 2, 1],
//   [3, 4, 1],
//   [4, 5, 1]
// ].map(([s, t, f]) => ({ source: s, target: t, datum: { flow: f } }));
// let graph = new EdgeList(6, edges);
// let Spos = 0,
//   Tpos = 5;

test("FordFulkerson", () => {
  let resEdge: any[][] = [];
  let count = 0;
  for (let step of new FordFulkerson().run(graph, Spos, Tpos)) {
    ++count;
    //resEdge.push(step.graph.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.log(`algo FordFulkerson : step count = ${count}`);
  //console.table(resEdge);
});

test("EdmondsKarp", () => {
  let resEdge: any[][] = [];
  let count = 0;
  for (let step of new EdmondsKarp().run(graph, Spos, Tpos)) {
    ++count;
    //resEdge.push(step.graph.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.log(`algo EdmondsKarp : step count = ${count}`);
  //console.table(resEdge);
});

test("Dinic", () => {
  let resEdge: any[][] = [];
  let res: number[][] = [];
  let count = 0;
  for (let step of new Dinic().run(graph, Spos, Tpos)) {
    ++count;
    //res.push(step.graph.nodes().map(n => n.datum.depth));
    //resEdge.push(step.graph.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.log(`algo Dinic : step count = ${count}`);
  //console.table(res);
  //console.table(resEdge);
});

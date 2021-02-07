import { MinCostFlow } from "./MinCostFlow";
import { ZkwMCF } from "./ZkwMCF";
import { EdgeList } from "../../GraphStructure";

import { graph, Tpos, Spos, limit } from "./LargeGraph.data";
// let edges = [
//   [0,1,2,0],
//   [0,2,2,0],
//   [1,2,1,4],
//   [1,4,2,3],
//   [2,3,1,4],
//   [2,5,2,5],
//   [3,5,2,1],
//   [3,6,1,0],
//   [4,3,2,2],
//   [4,5,2,5],
//   [5,6,2,0]
// ].map(([s, t, f, c]) => ({ source: s, target: t, datum: { flow: f, cost: c } }));
// let graph = new EdgeList(7, edges);
// let Spos = 0,
//   Tpos = 6,
//   limit = Infinity;

// let edges = [
//   [0, 1, 1, 2],
//   [0, 2, 4, 6],
//   [1, 2, 1, 2],
//   [1, 3, 4, 6],
//   [2, 3, 1, 2]
// ].map(([s, t, f, c]) => ({ source: s, target: t, datum: { flow: f, cost: c } }));
// let graph = new EdgeList(4, edges);
// let Spos = 0,
//   Tpos = 3,
//   limit = 1;

test("MinCostFlow", () => {
  let resEdge: any[][] = [];
  let res: number[][] = [];
  let count = 0;
  for (let step of new MinCostFlow().run(graph, Spos, Tpos, limit)) {
    ++count;
    //res.push(step.graph.nodes().map(n => n.datum.dist));
    //resEdge.push(step.graph.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.log(`algo MinCostFlow : step count = ${count}`);
  //console.table(res);
  //console.table(resEdge);
});

test("ZkwMCF", () => {
  let resEdge: any[][] = [];
  let res: number[][] = [];
  let count = 0;
  for (let step of new ZkwMCF().run(graph, Spos, Tpos, limit)) {
    ++count;
    //res.push(step.graph.nodes().map(n => n.datum.dist));
    // resEdge.push(step.graph.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }
  console.log(`algo ZkwMCF : step count = ${count}`);
  //console.table(res);
  // console.table(resEdge);
});

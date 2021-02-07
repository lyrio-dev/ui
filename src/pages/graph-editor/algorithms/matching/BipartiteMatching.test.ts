import { HungarianDFS } from "./BipartiteMatching";
import { BipartiteGraph, Graph } from "../../GraphStructure";

let E = [
  // [0, 6],
  // [0, 8],
  // [1, 9],
  // [1, 11],
  // [2, 7],
  // [2, 9],
  // [3, 10],
  // [4, 10],
  // [4, 11],
  // [5, 11]
  [0, 6],
  [0, 7],
  [1, 6],
  [3, 9],
  [3, 10],
  [4, 9],
  [4, 11],
  [5, 10]
].map(([s, t]) => ({ source: s, target: t, datum: {} }));
let G = new BipartiteGraph(6, 6, E);
let A = { matched: 5 };

test("HungarianDFS", () => {
  let algo = new HungarianDFS().run(G);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    resV.push(resG.nodes().map(n => n.datum.match));
    resE.push(resG.edges().map(e => (e.datum.marked ? 1 : 0) + (e.datum.matched ? 2 : 0)));
  }

  console.log(`algo HungarianDFS : step count = ${count}`);
  console.table(resV);
  console.table(resE);

  let R = step.value;
  expect(R).toEqual(A);
});

import { Gabow } from "./Matching";
import { EdgeList, Graph } from "../../GraphStructure";

let E = [
  [10, 3],
  [3, 16],
  [16, 1],
  [16, 4],
  [16, 14],
  [1, 15],
  [1, 13],
  [13, 5],
  [13, 8],
  [5, 12],
  [5, 6],
  [5, 9],
  [8, 6],
  [12, 6],
  [4, 11],
  [11, 7],
  [7, 9],
  [14, 2]
].map(([s, t]) => ({ source: s - 1, target: t - 1, datum: {} }));
let G = new EdgeList(16, E);
let A = { matched: 8 };

test("Gabow", () => {
  let algo = new Gabow().run(G);
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

  console.log(`algo Gabow : step count = ${count}`);
  console.table(resV);
  console.table(resE);

  let R = step.value;
  expect(R).toEqual(A);
});

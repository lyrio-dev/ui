import { FordFulkerson } from "./FordFulkerson";
import { EdmondsKarp } from "./EdmondsKarp";
import { Dinic } from "./Dinic";
import { Graph } from "../../GraphStructure";

import { G, S, T, Af } from "./data/Large.data";

// let E = [
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
// let G = new EdgeList(6, E);
// let S = 0;
// let T = 5;
// let A = ({flow: 5});

// let E = [
//   [0, 1, 1],
//   [0, 3, 1],
//   [1, 4, 1],
//   [2, 5, 1],
//   [3, 2, 1],
//   [3, 4, 1],
//   [4, 5, 1]
// ].map(([s, t, f]) => ({ source: s, target: t, datum: { flow: f } }));
// let G = new EdgeList(6, E);
// let S = 0;
// let T = 5;
// let A = ({flow: 2});

test("FordFulkerson", () => {
  let algo = new FordFulkerson().run(G, S, T);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    //resE.push(resG.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }

  console.log(`algo FordFulkerson : step count = ${count}`);
  //console.table(resV);
  //console.table(resE);

  let R = step.value;
  expect(R).toEqual(Af);
});

test("EdmondsKarp", () => {
  let algo = new EdmondsKarp().run(G, S, T);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    //resE.push(resG.edges().map(e => `[${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }

  console.log(`algo EdmondsKarp : step count = ${count}`);
  //console.table(resV);
  //console.table(resE);

  let R = step.value;
  expect(R).toEqual(Af);
});

test("Dinic", () => {
  let algo = new Dinic().run(G, S, T);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    //resV.push(resG.nodes().map(n => n.datum.depth));
    //resE.push(resG.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }

  console.log(`algo Dinic : step count = ${count}`);
  //console.table(resV);
  //console.table(resE);

  let R = step.value;
  expect(R).toEqual(Af);
});

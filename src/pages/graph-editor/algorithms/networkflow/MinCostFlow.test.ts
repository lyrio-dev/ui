import { MinCostFlow } from "./MinCostFlow";
import { ZkwMCF } from "./ZkwMCF";
import { Graph } from "../../GraphStructure";

import { G, S, T, Afc } from "./data/Large.data";

// let E = [
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
// let G = new EdgeList(7, E);
// let S = 0;
// let T = 6;
// let L = Infinity;
// let A = {flow: 3, cost: 15}

// let E = [
//   [0, 1, 1, 2],
//   [0, 2, 4, 6],
//   [1, 2, 1, 2],
//   [1, 3, 4, 6],
//   [2, 3, 1, 2]
// ].map(([s, t, f, c]) => ({ source: s, target: t, datum: { flow: f, cost: c } }));
// let G = new EdgeList(4, E);
// let S = 0;
// let T = 3;
// let L = 1;
// let A = {flow: 1, cost: 6};

test("MinCostFlow", () => {
  let algo = new MinCostFlow().run(G, S, T);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    //resV.push(resG.nodes().map(n => n.datum.dist));
    //resE.push(resG.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }

  console.log(`algo MinCostFlow : step count = ${count}`);
  //console.table(resV);
  //console.table(resE);

  let R = step.value;
  expect(R).toEqual(Afc);
});

test("ZkwMCF", () => {
  let algo = new ZkwMCF().run(G, S, T);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    //resV.push(resG.nodes().map(n => n.datum.dist));
    //resE.push(resG.edges().map(e => `[${e.datum.valid}/${e.datum.mark}](${e.datum.used}/${e.datum.flow})`));
  }

  console.log(`algo ZkwMCF : step count = ${count}`);
  //console.table(resV);
  //console.table(resE);

  let R = step.value;
  expect(R).toEqual(Afc);
});

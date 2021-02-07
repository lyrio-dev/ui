import { KuhnMunkres } from "./WeightedBipartiteMatching";
import { BipartiteMatrix, Graph } from "../../GraphStructure";

let M = [
  [3, 4, 6, 4, 9],
  [6, 4, 5, 3, 8],
  [7, 5, 3, 4, 2],
  [6, 3, 2, 2, 5],
  [8, 4, 5, 4, 7]
].map(line => line.map(w => ({ weight: w })));
let G = new BipartiteMatrix(M);
let A = { weight: 29 };

test("KuhnMunkres", () => {
  let algo = new KuhnMunkres().run(G);
  let step: any;

  let resG: Graph;
  let resV: any[][] = [];
  let resE: any[][] = [];
  let count = 0;

  while (!(step = algo.next()).done) {
    ++count;
    resG = step.value.graph;
    resV.push(resG.nodes().map(n => `${n.datum.match},${n.datum.l}`));
    resE.push(
      resG.edges().map(e => (e.datum.valid ? "v" : " ") + (e.datum.marked ? "m" : " ") + (e.datum.matched ? "M" : " "))
    );
  }

  console.log(`algo KuhnMunkres : step count = ${count}`);
  console.table(resV);
  console.table(resE);

  let R = step.value;
  expect(R).toEqual(A);
});

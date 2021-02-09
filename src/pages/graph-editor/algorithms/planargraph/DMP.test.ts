import { DMP } from "./DMP";
import { EdgeList, Graph } from "../../GraphStructure";
import { G, A } from "./data/DMP.data";

test("DMP", () => {
  for (let i = 1, cases = G.length; i < cases; ++i) {
    let algo = new DMP().run(G[i]);
    let step: any;

    let resG: Graph;
    let resV: any[][] = [];
    let resE: any[][] = [];
    let count = 0;

    while (!(step = algo.next()).done) {
      ++count;
      //resG = step.value.graph;
      //console.table(resG.nodes().map(n => n.datum.displayId));
      //resV.push(resG.nodes().map(n => n.datum.match));
      //resE.push(resG.edges().map(e => (e.datum.marked ? 1 : 0) + (e.datum.matched ? 2 : 0)));
    }

    console.log(`algo DMP : step count = ${count}`);
    //console.table(resV);
    //console.table(resE);

    let R = step.value;
    console.log(`algo DMP : result = ${R.planarity}`);
    expect(R.planarity).toEqual(A[i]);
  }
});

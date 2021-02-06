import { Gabow } from "./Matching";
import { EdgeList } from "../../GraphStructure";

test("Gabow", () => {
  let edges = [
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
  let graph = new EdgeList(16, edges);
  let res: number[][] = [];
  //let resNode: any[][]= [];
  let resEdge: number[][] = [];
  for (let step of new Gabow().run(graph)) {
    res.push(step.graph.nodes().map(n => n.datum.match));
    //resNode.push(step.graph.nodes().map(n => n.datum?.visit));
    resEdge.push(step.graph.edges().map(e => (e.datum.marked ? 1 : 0) + (e.datum.matched ? 2 : 0)));
  }
  console.table(res);
  //console.table(resNode);
  console.table(resEdge);
});

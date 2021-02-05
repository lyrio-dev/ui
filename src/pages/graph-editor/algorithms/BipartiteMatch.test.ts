import { HungarianDFS } from "./BipartiteMatch";
import { BipartiteGraph } from "../GraphStructure";

test("HungarianDFS", () => {
  let edges = [
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
  let graph = new BipartiteGraph(6, 6, edges);
  let res: number[][] = [];
  //let resNode: any[][]= [];
  let resEdge: number[][] = [];
  for (let step of new HungarianDFS().run(graph)) {
    res.push(step.graph.nodes().map(n => n.datum.match));
    //resNode.push(step.graph.nodes().map(n => n.datum?.visit));
    resEdge.push(step.graph.edges().map(e => (e.datum.marked ? 1 : 0) + (e.datum.matched ? 2 : 0)));
  }
  console.table(res);
  //console.table(resNode);
  console.table(resEdge);
});

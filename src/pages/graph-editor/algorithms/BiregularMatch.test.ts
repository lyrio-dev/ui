import { BGM } from "./BiregularMatch";
import { BipartiteGraph, Edge, Graph } from "../GraphStructure";

test("bgm", () => {
  let edges = [
    [0, 3], [0, 4], [0, 5], [1, 5], [2, 5]
  ].map(([s, t]) => ({ source: s, target: t, datum: {} }));
  let graph = new BipartiteGraph(3, 3, edges);
  let bgm = new BGM();
  let steps = Array
    .from(bgm.run(graph))
    .map(s => s.graph.edges())
    .map(nl => nl.map(n => n.datum.tag));
  console.table(steps);
});
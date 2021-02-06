import { CriticalPath } from "./CriticalPath";
import { AdjacencyMatrix } from "../GraphStructure";

test("CriticalPath", () => {
  let mat = [
    [0, 15, 15, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 5, 5, 0, 0, 0, 0, 5, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
    [0, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  ];
  let graph = new AdjacencyMatrix(mat, true);
  let topoSeq: number[][] = [];
  let dist: number[][] = [];
  for (let step of new CriticalPath().run(graph)) {
    topoSeq.push(step.graph.nodes().map(n => n.datum.topoSequence));
    dist.push(step.graph.nodes().map(n => n.datum.dist));
  }
  console.table(topoSeq);
  console.table(dist);
});

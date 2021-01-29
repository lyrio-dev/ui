import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { Graph, GraphBuilder } from "../GraphStructure";

export type DFSStep = Step;

export class DFS extends GraphAlgorithm {
  constructor() {
    super("DFS", "Depth First Search");
  }

  * dfs(nc: number, mat: number[][], this_node: number, dist: number[], prev: number[]): Generator<DFSStep> {
    // Yield step
    let { graph, error } = GraphBuilder.fromAdjacencyMatrix(
      mat,
      true, true,
      i => ({
        dist: dist[i],
        prev: prev[i]
      }),
      v => ({ weight: v })
    );
    if (error) throw new Error(error);
    if (graph) yield new Step(graph);

    // Normal dfs
    for (let i = 0; i < nc; i++) {
      if (i === this_node) continue;
      let new_dist = dist[this_node] + (mat[this_node][i] === 0 ? +Infinity : mat[this_node][i]);
      if (new_dist < dist[i]) {
        dist[i] = new_dist;
        prev[i] = this_node;
        yield* this.dfs(nc, mat, i, dist, prev);
      }
    }
  }

  run(graph: Graph, start_point: number) {
    let adjmat = graph.toAdjacencyMatrix();
    let dist: number[] = [], prev: number[] = [], nc = graph.getNodeCount();
    for (let i = 0; i < nc; i++) {
      dist[i] = +Infinity;
      prev[i] = i;
    }
    dist[start_point] = 0;
    return this.dfs(nc, adjmat, start_point, dist, prev);
  }
}
import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

export class DFS extends GraphAlgorithm {
  constructor() {
    super("DFS", "Depth First Search");
  }

  * dfs(nc: number, mat: number[][], this_node: number, dist: number[], prev: number[]): Generator<Step> {
    yield { graph: new AdjacencyMatrix(mat, true, i => ({ dist: dist[i], prev: prev[i] })) };
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
    let adjmat = AdjacencyMatrix.from(graph, true).mat;
    let dist: number[] = [], prev: number[] = [], nc = adjmat.length;
    for (let i = 0; i < nc; i++) {
      dist[i] = +Infinity;
      prev[i] = i;
    }
    dist[start_point] = 0;
    return this.dfs(nc, adjmat, start_point, dist, prev);
  }
}
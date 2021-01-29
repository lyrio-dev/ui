import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { Graph, WeightedEdgeDatum } from "../GraphStructure";

class DFSNodeDatum {
  constructor(public readonly sequence: number, public readonly visited: boolean) {}
}

export type DFSStep = Step<DFSNodeDatum, WeightedEdgeDatum>;

class DFS extends GraphAlgorithm<DFSNodeDatum, WeightedEdgeDatum, undefined> {
  constructor() {
    super("DFS", "Depth First Search");
  }

  *dfs(
    dfn: number,
    nc: number,
    mat: number[][],
    this_node: number,
    sequence: number[],
    visited: boolean[]
  ): Generator<DFSStep> {
    visited[this_node] = true;
    sequence[this_node] = dfn;

    // yield step
    let graph = Graph.fromAdjacencyMatrix<DFSNodeDatum, any>(mat, true, true, i => ({
      sequence: sequence[i],
      visited: visited[i]
    }));
    if (graph) yield new Step(graph);
    else throw new Error();

    // dfs
    for (let i = 0; i < nc; i++) {
      if (visited[i] == false && mat[this_node][i] != 0) {
        yield* this.dfs(dfn + 1, nc, mat, i, sequence, visited);
      }
    }
  }

  run(graph: Graph<any, any>, start_point: number) {
    let adjmat = graph.toAdjacencyMatrix();
    let sequence: number[] = [],
      visited: boolean[] = [],
      nc = graph.getNodeCount();
    for (let i = 0; i < nc; i++) {
      visited[i] = false;
    }
    return this.dfs(0, nc, adjmat, start_point, sequence, visited);
  }
}

export { DFSNodeDatum, DFS };

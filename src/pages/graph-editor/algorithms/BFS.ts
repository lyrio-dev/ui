import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { Graph } from "../GraphStructure";

class BFSNodeDatum {
  constructor(public readonly dist: number, public readonly visited: boolean) {}
}

export type BFSStep = Step<BFSNodeDatum, any>;

class BFS extends GraphAlgorithm<BFSNodeDatum, any, any> {
  constructor() {
    super("BFS", "Breadth First Search");
  }

  *bfs(nc: number, mat: number[][], st: number, dist: number[], visited: boolean[]): Generator<BFSStep> {
    (visited[st] = true), (dist[st] = 0);
    let que = [st],
      fr = 0,
      bk = 1;

    // bfs
    while (fr != bk) {
      // yield step
      let graph = Graph.fromAdjacencyMatrix<BFSNodeDatum, any>(mat, true, false, i => ({
        dist: dist[i],
        visited: visited[i]
      }));
      if (graph) yield new Step(graph);
      else throw new Error();

      let cur_node = que[fr++];
      for (let i = 0; i < nc; i++) {
        if (visited[i] == false && mat[cur_node][i] != 0) {
          dist[i] = dist[cur_node] + 1;
          visited[i] = true;
          que[bk++] = i;
        }
      }
    }
  }

  run(graph: Graph<any, any>, start_point: number) {
    let adjmat = graph.toAdjacencyMatrix();
    let dist: number[] = [],
      visited: boolean[] = [],
      nc = graph.getNodeCount();
    for (let i = 0; i < nc; i++) {
      visited[i] = false;
    }
    return this.bfs(nc, adjmat, start_point, dist, visited);
  }
}

export { BFSNodeDatum, BFS };

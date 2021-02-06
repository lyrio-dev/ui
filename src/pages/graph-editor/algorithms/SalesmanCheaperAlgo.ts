import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class SalesmanStep extends Step {
  constructor(public readonly graph: Graph, public readonly answer: number) {
    super(graph);
  }
}

class SalesmanCheaperAlgo extends GraphAlgorithm {
  constructor() {
    super("SalesmanProbCheaperAlgo", "Traveling Salesman Problem (Cheaper Algorithm)");
  }

  *salesmanCheaperAlgo(graph: Graph): Generator<SalesmanStep> {
    let nodes = [];
    let mat = AdjacencyMatrix.from(graph, true).mat;
    let answer = 0;

    for (let i = 0; i < graph.nodes().length; i++) {
      mat[i][i] = 0;
      nodes[i] = i;
      graph.nodes()[i].datum = { chosen: 0 };
    }

    for (let i = 0; i < graph.edges().length; i++) {
      graph.edges()[i].datum = { dist: graph.edges()[i].datum, chosen: 0 };
    }

    yield new SalesmanStep(graph, answer);

    //共进行n-1次操作
    for (let i = 0; i < graph.nodes().length - 1; i++) {
      //寻找最近的点对
      let minj = 0;
      let mink = graph.nodes().length - 1;
      for (let j = 0; j <= i; j++) {
        for (let k = i + 1; k < graph.nodes().length; k++) {
          if (mat[nodes[j]][nodes[k]] < mat[nodes[minj]][nodes[mink]]) {
            minj = j;
            mink = k;
          }
        }
      }

      //把该点合并入环
      let pre = (minj - 1 + (i + 1)) % (i + 1);
      let post = (minj + 1) % (i + 1);
      let curNode = nodes[minj];
      let insNode = nodes[mink];
      let preNode = nodes[pre];
      let postNode = nodes[post];

      let tmp = nodes[mink];
      nodes[mink] = nodes[i + 1];
      nodes[i + 1] = tmp;
      if (mat[preNode][insNode] < mat[postNode][insNode]) {
        for (let j = i + 1; j > minj; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj] = tmp;
        answer += mat[preNode][insNode] + mat[insNode][curNode] - mat[preNode][curNode];
        for (let edge of graph.edges()) {
          if (
            (edge.source == preNode && edge.target == insNode) ||
            (edge.source == insNode && edge.target == curNode)
          ) {
            edge.datum.chosen = 1;
          }
          if (edge.source == preNode && edge.target == curNode) {
            edge.datum.chosen = 0;
          }
        }
      } else {
        for (let j = i + 1; j > minj + 1; j--) {
          nodes[j] = nodes[j - 1];
        }
        nodes[minj + 1] = tmp;
        answer += mat[postNode][insNode] + mat[insNode][curNode] - mat[postNode][curNode];
        for (let edge of graph.edges()) {
          if (
            (edge.source == curNode && edge.target == insNode) ||
            (edge.source == insNode && edge.target == postNode)
          ) {
            edge.datum.chosen = 1;
          }
          if (edge.source == curNode && edge.target == postNode) {
            edge.datum.chosen = 0;
          }
        }
      }
      yield new SalesmanStep(graph, answer);
    }
  }

  run(graph: Graph) {
    return this.salesmanCheaperAlgo(graph);
  }
}

export { SalesmanStep, SalesmanCheaperAlgo };

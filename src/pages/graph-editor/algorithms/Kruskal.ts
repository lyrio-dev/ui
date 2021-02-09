import { GraphAlgorithm } from "../GraphAlgorithm";
import { AdjacencyMatrix, Graph } from "../GraphStructure";

class Kruskal extends GraphAlgorithm {
  constructor() {
    super("Kruskal", "Minimum Spanning Tree - Kruskal");
  }

  father = [];

  //并查集
  getFather(node: number) {
    if (this.father[node] != node) {
      this.father[node] = this.getFather(this.father[node]);
    }
    return this.father[node];
  }

  *run(graph: Graph) {
    let edges = [];
    let counter = 0;
    Object.assign(edges, AdjacencyMatrix.from(graph, false).edges());

    //排序（冒泡排序）
    for (let i = 0; i < edges.length; i++) {
      for (let j = 0; j < edges.length - 1; j++) {
        if (edges[j].datum > edges[j + 1].datum) {
          let tmp = edges[j];
          edges[j] = edges[j + 1];
          edges[j + 1] = tmp;
        }
      }
      graph.edges()[i].datum = { dist: graph.edges()[i].datum, chosen: 0 };
    }

    //并查集初始化
    for (let i = 0; i < graph.nodes().length; i++) {
      this.father[i] = i;
    }

    //Kruskal
    for (let i = 0; i < edges.length; i++) {
      for (let j = 0; j < graph.edges().length; j++) {
        if (graph.edges()[j].source == edges[i].source && graph.edges()[j].target == edges[i].target) {
          graph.edges()[j].datum.chosen = 2;
        }
      }
      this.father[edges[i].source] = this.getFather(edges[i].source);
      this.father[edges[i].target] = this.getFather(edges[i].target);
      if (this.father[edges[i].source] != this.father[edges[i].target]) {
        this.father[this.father[edges[i].source]] = this.father[edges[i].target];
        counter++;
        for (let j = 0; j < graph.edges().length; j++) {
          if (graph.edges()[j].source == edges[i].source && graph.edges()[j].target == edges[i].target) {
            graph.edges()[j].datum.chosen = 1;
          }
        }
      }

      yield { graph };

      for (let j = 0; j < graph.edges().length; j++) {
        if (graph.edges()[j].datum.chosen == 2) {
          graph.edges()[j].datum.chosen = 0;
          yield { graph };
        }
      }

      if (counter == graph.nodes().length - 1) {
        break;
      }
    }
  }
}

export { Kruskal };

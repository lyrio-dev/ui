import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyMatrix, Edge, Graph } from "../GraphStructure";

class SalesmanStep extends Step {
  constructor(public readonly graph: Graph, public readonly answer: number) {
    super(graph);
  }
}

class SalesmanPath extends GraphAlgorithm {
  constructor() {
    super("SalesmanProb", "Traveling Salesman Problem");
  }

  judge(graph: Graph, edges: Edge[]) {
    //判断是否有点度大于2（排除分支情况）
    let cnt = [];
    for (let i in graph.nodes()) {
      cnt[i] = 0;
    }
    for (let edge of edges) {
      if (edge.datum.chosen == true) {
        cnt[edge.source]++;
        cnt[edge.target]++;
        if (cnt[edge.source] > 2 || cnt[edge.target] > 2) {
          return 0;
        }
      }
    }

    //判断是否连通（排除多回路情况）
    let scc = [];
    for (let i in graph.nodes()) {
      scc[i] = Number(i);
    }
    for (let i = 0; i < graph.nodes().length; i++) {
      for (let edge of edges) {
        if (edge.datum.chosen == 1) {
          if (scc[edge.source] < scc[edge.target]) {
            scc[edge.target] = scc[edge.source];
          } else {
            scc[edge.source] = scc[edge.target];
          }
        }
      }
    }
    for (let i in graph.nodes()) {
      if (scc[i] != 0) {
        return 0;
      }
    }
    return 2;
  }

  *salesmanProb(graph: Graph, edges: Edge[]): Generator<SalesmanStep> {
    let node = 0;
    let chosenCnt = 0;
    let now = 0;
    //界初始时为无穷
    let boundary = Infinity;

    //所有边初始时均为未选中状态
    for (let i = 0; i < edges.length; i++) {
      edges[i].datum = { dist: edges[i].datum, chosen: 0 };
    }

    while (node >= 0) {
      //选择足够的边
      while (chosenCnt < 5) {
        edges[node].datum.chosen = 1;
        now += edges[node].datum.dist;
        node++;
        chosenCnt++;
      }

      //选择了新边，记录选边情况
      graph.edges().forEach(cur_edge => {
        cur_edge.datum = { chosen: 0 };
        for (let edge of edges) {
          if (edge.datum.chosen == 1 && cur_edge.source == edge.source && cur_edge.target == edge.target) {
            cur_edge.datum = { chosen: 1 };
          }
        }
      });

      //判断选择是否合法
      let judRes = now >= boundary ? 1 : this.judge(graph, edges);
      //更新答案
      if (judRes == 2) {
        if (now < boundary) {
          boundary = now;
        }
      }
      yield new SalesmanStep(graph, boundary);

      //退栈
      if (judRes > 0 || node >= edges.length) {
        while (--node >= 0) {
          if (edges[node].datum.chosen == 0) {
            break;
          } else {
            edges[node].datum.chosen = 0;
            now -= edges[node].datum.dist;
            chosenCnt--;
          }
        }
      }

      //继续深探
      while (--node >= 0) {
        if (edges[node].datum.chosen == 1) {
          edges[node].datum.chosen = 0;
          now -= edges[node].datum.dist;
          node++;
          chosenCnt--;
          break;
        }
      }
    }
  }

  run(graph: Graph) {
    let edges = [];
    Object.assign(edges, AdjacencyMatrix.from(graph, true).edges());

    //排序（冒泡排序）
    for (let i = 0; i < edges.length; i++) {
      for (let j = 0; j < edges.length - 1; j++) {
        if (edges[j].datum > edges[j + 1].datum) {
          let tmp = edges[j];
          edges[j] = edges[j + 1];
          edges[j + 1] = tmp;
        }
      }
    }
    return this.salesmanProb(graph, edges);
  }
}

export { SalesmanStep, SalesmanPath };

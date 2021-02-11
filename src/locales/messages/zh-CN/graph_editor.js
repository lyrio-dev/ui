module.exports = {
  title: "图编辑器",
  graph: {
    random: {
      name: "随机图"
    },
    edge_list: {
      name: "边列表"
    },
    adjmat: {
      name: "邻接矩阵",
      error: {
        non_square: "邻接矩阵应为方阵",
        asymmetric: "无向图的邻接矩阵应对称",
        multiple_edges: "邻接矩阵不允许有重边"
      }
    },
    adjlist: {
      name: "邻接链表"
    },
    bipartite: {
      name: "二分图",
      error: {
        not_bipartite: "非二分图"
      }
    },
    bipmat: {
      name: "二分图矩阵",
      error: {
        multiple_edges: "边矩阵不允许有重边"
      }
    },
    incmat: {
      name: "关联矩阵",
      error: {
        non_matrix: "输入非矩阵",
        invalid_edge_directed: "有向图中，每一列应有且只有一个1和-1",
        invalid_edge_undirected: "无向图中，每一列应有且只有两个1"
      }
    }
  },
  input: {
    error: {
      nan: "输入并不能转化为数字",
      zero_or_one: "无向图的边中只允许0或1"
    },
    props: {
      node_count: "节点数",
      edge_count: "边数",
      max_weight: "最大边权",
      directed: "有向图？",
      weighted: "加权图？",
      self_loop: "允许自环？",
      multiple_edges: "允许重边？"
    }
  }
};

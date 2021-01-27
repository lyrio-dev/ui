class Node<NodeDatum = undefined> {
  public constructor(
    public readonly id: number,
    public datum?: NodeDatum
  ) {
  }

  public datumType() {
    return typeof this.datum;
  }
}

class Edge<EdgeDatum = undefined> {
  public constructor(
    public readonly source: number,
    public readonly target: number,
    public datum?: EdgeDatum
  ) {
  }

  public datumType() {
    return typeof this.datum;
  }
}

class WeightedEdgeDatum {
  public constructor(public readonly weight: number) {
  }
}

class WeightedEdge<EdgeDatum = undefined> extends Edge<EdgeDatum | WeightedEdgeDatum> {
  public constructor(source: number, target: number, weight: number, datum?: EdgeDatum) {
    super(source, target, { weight, ...datum });
  }

  public weight() {
    return (this.datum as WeightedEdgeDatum).weight;
  }
}

enum GraphOption {
  Directed = 1 << 0,
  Weighted = 1 << 1,
  NoSelfLoop = 1 << 2,
  NoMultipleEdges = 1 << 3,
  Simple = NoSelfLoop | NoMultipleEdges,
}

class Graph<NodeDatum, EdgeDatum> {
  private nodes: Node<NodeDatum>[];
  private edges: Edge<EdgeDatum>[];

  public constructor(node_count: number, node_data?: (idx: number) => NodeDatum, edges?: Edge<EdgeDatum>[], public readonly option: GraphOption = 0, unchecked: boolean = false) {
    this.nodes = Array.from({ length: node_count }, (_, i) => new Node<NodeDatum>(i, node_data ? node_data(i) : undefined));

    this.edges = edges ? [...edges] : [];

    if (unchecked) return;

    function isBetween(x: number, a: number, b: number) {
      return a <= x && x < b;
    }

    this.edges.filter(e => {
      let good = isBetween(e.source, 0, node_count) && isBetween(e.target, 0, node_count);
      if (!good)
        console.warn(`Edge ${e} is invalid.`);
      return good;
    });

    // Undirected
    if ((option & GraphOption.Directed) === 0) {
      this.edges.map(e => new Edge<EdgeDatum>(
        Math.min(e.source, e.target),
        Math.max(e.source, e.target),
        e.datum
      ));
    }

    // Weighted: check edge.datum.weigh is present
    if (option & GraphOption.Weighted) {
      this.edges.filter(e => {
        let datum: any = e.datum;
        let good = datum && "weight" in datum && datum.weight > 0;
        if (!good) console.warn(`Unweighted edge ${e} in weighted graph.`);
        return good;
      });
    }

    // No self loop
    if (option & GraphOption.NoSelfLoop) {
      this.edges.filter(e => {
        let good = e.source === e.target;
        if (!good) console.warn(`Self-loop ${e} is detected and removed.`);
        return good;
      });
    }

    // No multiple edge
    if (option & GraphOption.NoMultipleEdges) {
      let edge_set = new Set<[number, number]>();
      this.edges.filter(e => {
        let edge: [number, number] = [e.source, e.target];
        let good = !edge_set.has(edge);
        if (good) edge_set.add(edge);
        else console.warn(`Multiple edges are not allowed. ${e} has been removed.`);
        return good;
      });
    }
  }

  getNodeById(node_id: number) {
    return this.nodes[node_id];
  }

  getNodeList() {
    return [...this.nodes];
  }

  getNodeCount() {
    return this.nodes.length;
  }

  getEdgeList() {
    return [...this.edges];
  }

  getEdgeCount() {
    return this.edges.length;
  }

  toAdjacencyMatrix() {
    let mat: number[][] = [];
    for (let i = 0; i < this.nodes.length; i++) {
      mat[i] = [];
      for (let j = 0; j < this.nodes.length; j++) {
        mat[i][j] = 0;
      }
    }
    if (!(this.option & GraphOption.NoMultipleEdges) &&
      (this.option & GraphOption.Weighted)) {
      console.warn("The adjacency matrix of weighted graph with multiple edges may loss data.");
    }
    this.edges.forEach(e => {
      let w: number = (this.option & GraphOption.Weighted) ? (e.datum as any).weight : 1;
      let s = e.source, t = e.target;
      mat[s][t] = w;
      if (!(this.option & GraphOption.Directed)) mat[t][s] = w;
    });
    return mat;
  }

  static fromAdjacencyMatrix<ND, ED>(mat: number[][], directed: boolean, weighted: boolean, node_data?: (idx: number) => ND, edge_mapper?: (v: number) => ED): Graph<ND, ED> | null {
    let node_count = mat.length;
    for (let line of mat)
      if (line.length !== node_count)
        return null;
    let edges: Edge<ED>[] = [];
    for (let i = 0; i < node_count; i++) {
      for (let j = directed ? i : 0; j < node_count; j++) {
        if (!directed && mat[i][j] !== mat[j][i]) return null;
        if (mat[i][j] === 0) continue;
        edges.push(new Edge<ED>(i, j, edge_mapper?.(mat[i][j])));
      }
    }
    return new Graph(node_count, node_data, edges, GraphOption.NoMultipleEdges | (directed ? GraphOption.Directed : 0) | (weighted ? GraphOption.Weighted : 0), true);
  }

  static fromRandom<ND, ED>(node_count: number, edge_count: number, option: GraphOption, max_weight: number = 0, node_data?: (idx: number) => ND, edge_mapper?: (v: number) => ED): Graph<ND, ED> {
    let edges: Edge<ED>[] = [];
    let edge_set: Set<number>[] = [];
    let randint = (limit: number) => Math.floor(Math.random() * limit);
    let limit_edge_count = (ec: number, limit: number) => {
      if (ec > limit) {
        console.warn("Edge count is bigger than limit.");
        return limit;
      }
      return ec;
    };
    let has_edge = (x: number, y: number) => {
      if (edge_set[x]) return edge_set[x].has(y);
      edge_set[x] = new Set<number>();
      return false;
    };
    if (option & GraphOption.NoMultipleEdges) {
      edge_count = limit_edge_count(edge_count,
        ((option & GraphOption.NoSelfLoop) ? node_count * (node_count - 1) : node_count * (node_count + 1)) /
        ((option & GraphOption.Directed) ? 1 : 2)
      );
    }
    while (edge_count > 0) {
      let x = randint(node_count), y = randint(node_count);
      if ((option & GraphOption.NoSelfLoop) && x === y) continue;
      if (!(option & GraphOption.Directed)) {
        [x, y] = [Math.min(x, y), Math.max(x, y)];
      }
      if (option & GraphOption.NoMultipleEdges) {
        if (has_edge(x, y)) continue;
        edge_set[x].add(y);
      }
      let w = (option & GraphOption.Weighted) ? randint(max_weight) + 1 : 1;
      edges.push(new Edge<ED>(x, y, edge_mapper?.(w)));
      --edge_count;
    }
    return new Graph(node_count, node_data, edges, option, true);
  }
}

export { Node, Edge, Graph, GraphOption, WeightedEdgeDatum, WeightedEdge };
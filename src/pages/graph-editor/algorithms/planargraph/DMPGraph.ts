import { Edge, Graph, Node, NodeEdgeList } from "../../GraphStructure";

export class DMPGraph extends NodeEdgeList implements Graph {
  private adjacencyList: Edge[][];

  refreshAdjList() {
    let adjlist = Array.from<any, [number, any][]>({ length: this._nodes.length }, () => []);
    this._edges.forEach(({ source: s, target: t }, id) => {
      adjlist[s].push([t, { id }]), adjlist[t].push([s, { id }]);
    });
    this.adjacencyList = adjlist.map((line, source) =>
      line.map<Edge>(([target, datum]) => ({ source, target, datum }))
    );
  }

  constructor(_nodes: Node[], _edges: Edge[]) {
    _edges = _edges.map(edge =>
      edge.source <= edge.target ? edge : { source: edge.target, target: edge.source, datum: edge.datum }
    );
    _nodes.forEach((node, id) => Object.assign(node.datum, { displayId: id, tag: 0, active: false }));
    _edges.forEach(edge => Object.assign(edge.datum, { tag: 0, active: false, mark: false }));
    super(_nodes, _edges);
    this.refreshAdjList();
  }

  static from(g: Graph): DMPGraph {
    return new DMPGraph(g.nodes(), g.edges());
  }

  active(flag: boolean = true) {
    this._nodes.forEach(n => (n.datum.active = flag));
    this._edges.forEach(e => (e.datum.active = flag));
  }

  subGraph(nodeList: number[]): DMPGraph {
    let nodeCount = nodeList.length;
    let nodeMapping: number[] = Array.from({ length: this.nodes().length }, () => -1);
    nodeList.forEach((nodeId, i) => (nodeMapping[nodeId] = i));
    let newNodes: Node[] = Array.from({ length: nodeCount }, (_, i) => ({ id: i, datum: {} }));
    let newEdges: Edge[] = [];
    this.edges().forEach(({ source: s, target: t }) => {
      if (nodeMapping[s] !== -1 && nodeMapping[t] !== -1)
        newEdges.push({ source: nodeMapping[s], target: nodeMapping[t], datum: {} });
    });
    let newGraph = new DMPGraph(newNodes, newEdges);
    newGraph.nodes().forEach((node, i) => (node.datum.displayId = this._nodes[nodeList[i]].datum.displayId));
    return newGraph;
  }

  reMap(delta: number): NodeEdgeList {
    return new NodeEdgeList(
      this._nodes.map(({ id: i, datum: d }) => ({ id: i + delta, datum: d })),
      this._edges.map(({ source: s, target: t, datum: d }) => ({ source: s + delta, target: t + delta, datum: d }))
    );
  }

  // remove self loop & mutiple edges
  _simplify(): boolean {
    let edgeCount = this._edges.length;
    this._edges = this._edges.filter(({ source: s, target: t }) => s !== t);
    let edgeSet = Array.from({ length: this._nodes.length }, () => new Set<number>());
    this._edges = this._edges.filter(({ source: s, target: t }) => edgeSet[s].size !== edgeSet[s].add(t).size);
    this.refreshAdjList();
    return this._edges.length !== edgeCount;
  }

  // remove sl, me & naive nodes(degree <= 2)
  simplify() {
    let changed = true;
    while (changed) {
      changed = this._simplify();

      this.adjacencyList.every((edges, s) => {
        if (edges.length > 2) return true;
        else changed = true;

        if (edges.length === 2) {
          let t1 = edges[0].target,
            t2 = edges[1].target;
          this._edges.push({ source: t1, target: t2, datum: {} });
        }
        let newNodes = Array.from({ length: this._nodes.length }, (_, i) => i).filter(i => i !== s);
        let newGraph = this.subGraph(newNodes);
        this._nodes = newGraph.nodes();
        this._edges = newGraph.edges();
        this.refreshAdjList();

        return false;
      });
    }
  }

  adjacentEdges(pos: number) {
    return this.adjacencyList[pos];
  }

  mark(nodeList: number[]) {
    let nodeMap: boolean[] = Array.from({ length: this._nodes.length }, () => false);
    nodeList.forEach(i => (nodeMap[i] = true));
    this._edges.forEach(e => {
      if (e.datum.tag !== 2 && nodeMap[e.source] && nodeMap[e.target]) e.datum.mark = true;
    });
  }

  clearMark() {
    this._edges.forEach(e => (e.datum.mark = false));
  }
}

export class Face {
  constructor(public nodesId: number[] = []) {}

  check(nodeList: number[]): boolean {
    return nodeList.every(i => this.nodesId.includes(i));
  }
}

export class Fragment {
  public validFacesId: number[] = [];

  constructor(public nNodesId: number[] = [], public cNodesId: number[] = []) {}

  nodesId() {
    return this.nNodesId.concat(this.cNodesId);
  }
}

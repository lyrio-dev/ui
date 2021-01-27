import { Edge, Graph, GraphOption, WeightedEdge, WeightedEdgeDatum, GraphBuilder } from "./GraphStructure";
import * as GraphData from "./test.json";

test("Graph node init", () => {
  let g = new Graph(GraphData.nc, undefined, GraphData.edges.map<Edge>(e => new Edge(e.source, e.target)));
  g.getNodeList().forEach((n, i) => expect(n.id).toEqual(i));
});

test("AdjMat", () => {
  let edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [1, 4]
  ].map<Edge>(e => new Edge(e[0], e[1]));
  let expected = [
    [0, 1, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 0],
    [0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0]
  ];
  let g = new Graph(5, undefined, edges);
  expect(g.toAdjacencyMatrix()).toStrictEqual(expected);
});

test("AdjMat weighted", () => {
  let edges = [
    [0, 1, 10], [1, 2, 12], [2, 3, 32], [3, 4, 18], [0, 2, 92], [1, 4, 10]
  ].map(e => new WeightedEdge(e[0], e[1], e[2]));
  let expected = [
    [0, 10, 92, 0, 0],
    [10, 0, 12, 0, 10],
    [92, 12, 0, 32, 0],
    [0, 0, 32, 0, 18],
    [0, 10, 0, 18, 0]
  ];
  let g = new Graph(5, undefined, edges, GraphOption.Weighted | GraphOption.NoMultipleEdges);
  expect(g.toAdjacencyMatrix()).toStrictEqual(expected);
});

test("from AdjMat", () => {
  let adjmat = [
    [0, 10, 92, 0, 0],
    [10, 0, 12, 0, 10],
    [92, 12, 0, 32, 0],
    [0, 0, 32, 0, 18],
    [0, 10, 0, 18, 0]
  ];
  expect(adjmat).toStrictEqual(GraphBuilder.fromAdjacencyMatrix<undefined, WeightedEdgeDatum>(adjmat, false, true, undefined, v => ({ weight: v }))?.toAdjacencyMatrix());
});

test("Random", () => {
  let g = GraphBuilder.fromRandom(20, 150, GraphOption.NoMultipleEdges | GraphOption.NoSelfLoop);
  expect(g.getNodeCount()).toEqual(20);
  expect(g.getEdgeCount()).toEqual(150);
  let adjmat = g.toAdjacencyMatrix();
  console.table(adjmat);
  let add = (x: number, y: number) => x + y;
  let one_count = adjmat.map(line => line.reduce(add)).reduce(add);
  expect(one_count).toEqual(300);
});
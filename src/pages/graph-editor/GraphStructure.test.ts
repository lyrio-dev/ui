import { Edge, Graph, GraphOption, GraphBuilder } from "./GraphStructure";
import * as GraphData from "./test.json";

test("Graph node init", () => {
  let g = new Graph(GraphData.nc, GraphData.edges.map<Edge>(e => new Edge(e.source, e.target)));
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
  let g = new Graph(5, edges);
  expect(g.toAdjacencyMatrix()).toStrictEqual(expected);
});

test("AdjMat weighted", () => {
  let edges = [
    [0, 1, 10], [1, 2, 12], [2, 3, 32], [3, 4, 18], [0, 2, 92], [1, 4, 10]
  ].map(e => new Edge(e[0], e[1], { weight: e[2] }));
  let expected = [
    [0, 10, 92, 0, 0],
    [10, 0, 12, 0, 10],
    [92, 12, 0, 32, 0],
    [0, 0, 32, 0, 18],
    [0, 10, 0, 18, 0]
  ];
  let g = new Graph(5, edges, undefined, GraphOption.Weighted | GraphOption.NoMultipleEdges);
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
  expect(adjmat).toStrictEqual(
    GraphBuilder.fromAdjacencyMatrix(
      adjmat, false, true, undefined, v => ({ weight: v })
    ).graph?.toAdjacencyMatrix()
  );
});

test("from AdjMat directed", () => {
  let adjmat = [
    [1, 2, 3, 4, 0],
    [0, 6, 0, 3, 0],
    [9, 4, 2, 0, 5],
    [2, 0, 6, 0, 4],
    [0, 3, 0, 8, 9]
  ];
  expect(adjmat).toStrictEqual(
    GraphBuilder.fromAdjacencyMatrix(
      adjmat, true, true, undefined, v => ({ weight: v })
    ).graph?.toAdjacencyMatrix()
  );
});

test("Random", () => {
  let res = GraphBuilder.fromRandom(20, 150, GraphOption.NoMultipleEdges | GraphOption.NoSelfLoop);
  if (res.error) throw new Error(res.error);
  let g = res.graph;
  expect(g.getNodeCount()).toEqual(20);
  expect(g.getEdgeCount()).toEqual(150);
  let adjmat = g.toAdjacencyMatrix();
  let add = (x: number, y: number) => x + y;
  let one_count = adjmat.map(line => line.reduce(add)).reduce(add);
  expect(one_count).toEqual(300);
});

test("to Adj list", () => {
  let edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 2], [1, 4]
  ].map<Edge>(e => new Edge(e[0], e[1]));
  let E = (s: number, t: number) => new Edge(s, t);
  let expected = [
    [E(0, 1), E(0, 2)],
    [E(1, 0), E(1, 2), E(1, 4)],
    [E(2, 1), E(2, 3), E(2, 0)],
    [E(3, 2), E(3, 4)],
    [E(4, 3), E(4, 1)]
  ];
  let g = new Graph(5, edges);
  expect(g.toAdjacencyList()).toStrictEqual(expected);
});
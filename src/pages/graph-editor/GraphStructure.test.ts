import {
  AdjacencyList,
  AdjacencyMatrix,
  Edge,
  EdgeList,
  fromRandom,
  hasMultipleEdges,
  hasSelfLoop,
  IncidenceMatrix
} from "./GraphStructure";

test("AdjMat", () => {
  let edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 2],
    [1, 4]
  ].map<Edge>(([source, target]) => ({ source, target, datum: {} }));
  let expected1 = [
    [0, 1, 1, 0, 0],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 0],
    [0, 0, 1, 0, 1],
    [0, 1, 0, 1, 0]
  ];
  let expected2 = [
    [0, 1, 1, 0, 0],
    [0, 0, 1, 0, 1],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0]
  ];
  let g = new EdgeList(5, edges);
  expect(AdjacencyMatrix.from(g, false).mat.map(line => line.map(e => (e ? 1 : 0)))).toStrictEqual(expected1);
  expect(AdjacencyMatrix.from(g, true).mat.map(line => line.map(e => (e ? 1 : 0)))).toStrictEqual(expected2);
});

test("AdjMat weighted", () => {
  let edges = [
    [0, 1, 10],
    [1, 2, 12],
    [2, 3, 32],
    [3, 4, 18],
    [0, 2, 92],
    [1, 4, 10]
  ].map(([s, t, d]) => ({ source: s, target: t, datum: { weight: d } }));
  let expected1 = [
    [0, 10, 92, 0, 0],
    [10, 0, 12, 0, 10],
    [92, 12, 0, 32, 0],
    [0, 0, 32, 0, 18],
    [0, 10, 0, 18, 0]
  ];
  let expected2 = [
    [0, 10, 92, 0, 0],
    [0, 0, 12, 0, 10],
    [0, 0, 0, 32, 0],
    [0, 0, 0, 0, 18],
    [0, 0, 0, 0, 0]
  ];
  let g = new EdgeList(5, edges);
  expect(AdjacencyMatrix.from(g, false).mat.map(line => line.map(e => (e ? e.weight : 0)))).toStrictEqual(expected1);
  expect(AdjacencyMatrix.from(g, true).mat.map(line => line.map(e => (e ? e.weight : 0)))).toStrictEqual(expected2);
});

test("from AdjMat", () => {
  let adjmat = [
    [0, 10, 92, 0, 0],
    [10, 0, 12, 0, 10],
    [92, 12, 0, 32, 0],
    [0, 0, 32, 0, 18],
    [0, 10, 0, 18, 0]
  ];
  let expect1 = [
    [0, 1, 10],
    [0, 2, 92],
    [1, 2, 12],
    [1, 4, 10],
    [2, 3, 32],
    [3, 4, 18]
  ];
  let expect2 = [
    [0, 1, 10],
    [0, 2, 92],
    [1, 0, 10],
    [1, 2, 12],
    [1, 4, 10],
    [2, 0, 92],
    [2, 1, 12],
    [2, 3, 32],
    [3, 2, 32],
    [3, 4, 18],
    [4, 1, 10],
    [4, 3, 18]
  ];
  let g1 = new AdjacencyMatrix(adjmat, false);
  let g2 = new AdjacencyMatrix(adjmat, true);
  expect(g1.edges().map(({ source: s, target: t, datum: d }) => [s, t, d])).toStrictEqual(expect1);
  expect(g2.edges().map(({ source: s, target: t, datum: d }) => [s, t, d])).toStrictEqual(expect2);
});

test("hasSelfLoop", () => {
  let data: [[number, number][], boolean][] = [
    [
      [
        [0, 0],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      true
    ],
    [
      [
        [0, 1],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      false
    ],
    [
      [
        [0, 3],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      false
    ],
    [
      [
        [0, 3],
        [1, 1],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      true
    ],
    [
      [
        [0, 4],
        [1, 2],
        [3, 4],
        [0, 1],
        [4, 0],
        [2, 3]
      ],
      false
    ]
  ];
  for (let datum of data) {
    let g = new EdgeList(
      5,
      datum[0].map(([s, t]) => ({ source: s, target: t, datum: {} }))
    );
    expect(hasSelfLoop(g)).toEqual(datum[1]);
  }
});

test("hasMultipleEdges", () => {
  let data: [[number, number][], boolean][] = [
    [
      [
        [0, 0],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      false
    ],
    [
      [
        [0, 1],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      true
    ],
    [
      [
        [0, 3],
        [1, 2],
        [3, 4],
        [0, 1],
        [0, 4],
        [2, 3]
      ],
      false
    ],
    [
      [
        [0, 3],
        [1, 1],
        [3, 4],
        [1, 1],
        [0, 4],
        [2, 3]
      ],
      true
    ],
    [
      [
        [0, 4],
        [1, 2],
        [3, 4],
        [0, 1],
        [4, 0],
        [2, 3]
      ],
      false
    ]
  ];
  for (let datum of data) {
    let g = new EdgeList(
      5,
      datum[0].map(([s, t]) => ({ source: s, target: t, datum: {} }))
    );
    expect(hasMultipleEdges(g)).toEqual(datum[1]);
  }
});

test("Random", () => {
  let g = fromRandom(10, 30, true, false, false, true);
  expect(!hasMultipleEdges(g));
  expect(g.nodes().length).toBe(10);
  expect(g.edges().length).toBe(30);
  console.table(AdjacencyMatrix.from(g, true).mat);
});

test("to Adj list", () => {
  let edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 2],
    [1, 4]
  ].map<Edge>(e => ({ source: e[0], target: e[1], datum: {} }));
  let expected = [
    [1, 2],
    [0, 2, 4],
    [1, 3, 0],
    [2, 4],
    [3, 1]
  ];
  expect(AdjacencyList.from(new EdgeList(5, edges), false).adjlist.map(line => line.map(([t, _]) => t))).toStrictEqual(
    expected
  );
});

test("incmat directed", () => {
  let edges = [
    [1, 0],
    [0, 2],
    [4, 0],
    [4, 1],
    [2, 1],
    [2, 1],
    [1, 2],
    [2, 3],
    [3, 4]
  ];
  let incmat = [
    [1, -1, 1, 0, 0, 0, 0, 0, 0],
    [-1, 0, 0, 1, 1, 1, -1, 0, 0],
    [0, 1, 0, 0, -1, -1, 1, -1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, -1],
    [0, 0, -1, -1, 0, 0, 0, 0, 1]
  ];
  let incmatEdges = new IncidenceMatrix(incmat, true).edges().map(({ source: s, target: t }) => [s, t]);
  let incmatGen = IncidenceMatrix.from(
    new EdgeList(
      5,
      edges.map(([s, t]) => ({
        source: s,
        target: t,
        datum: {}
      }))
    ),
    true
  ).incmat;
  expect(incmatEdges).toStrictEqual(edges);
  expect(incmatGen).toStrictEqual(incmat);
});

test("incmat", () => {
  let edges = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 4],
    [1, 2],
    [1, 2],
    [2, 3],
    [3, 4]
  ];
  let incmat = [
    [1, 1, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0, 1]
  ];
  let incmatEdges = new IncidenceMatrix(incmat, false).edges().map(({ source: s, target: t }) => [s, t]);
  let incmatGen = IncidenceMatrix.from(
    new EdgeList(
      5,
      edges.map(([s, t]) => ({
        source: s,
        target: t,
        datum: {}
      }))
    ),
    false
  ).incmat;
  expect(incmatEdges).toStrictEqual(edges);
  expect(incmatGen).toStrictEqual(incmat);
});

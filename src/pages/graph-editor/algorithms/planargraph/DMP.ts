import { GraphAlgorithm, Step } from "../../GraphAlgorithm";
import { Edge, Graph, Node, NodeEdgeList } from "../../GraphStructure";
import { DMPGraph, Face, Fragment } from "./DMPGraph";

function clear<type>(buf: type[], val: type, cnt: number) {
  for (let _ = 0; _ < cnt; ++_) buf[_] = val;
}

function max<type>(x: type, y: type): type {
  if (x >= y) return x;
  return y;
}

function min<type>(x: type, y: type): type {
  if (x <= y) return x;
  return y;
}

class DMP extends GraphAlgorithm {
  constructor() {
    super("DMP", "Demoucron-Malgrange-Pertuiset Algorithm for Planarity Testing");
  }

  private graphs: DMPGraph[] = [];

  split(graph: DMPGraph): DMPGraph[] {
    let res: DMPGraph[] = [];
    let n = graph.nodes().length,
      cnt = 0;
    let dfn: number[] = [];
    let low: number[] = [];
    let stack: number[] = [];
    clear(dfn, 0, n), clear(low, 0, n);

    function newBCC(p: number, q: number) {
      let nodeList: number[] = [p];
      let t: number;
      do nodeList.push((t = stack.pop()));
      while (t !== q);
      //console.log(`nodelist: ${nodeList}`);
      res.push(graph.subGraph(nodeList));
    }

    function dfs1(p: number, f: number = -1) {
      low[p] = dfn[p] = ++cnt;
      stack.push(p);
      for (let { target: q } of graph.adjacentEdges(p)) {
        if (q === f) continue;
        if (dfn[q] === 0) {
          dfs1(q, p);
          low[p] = min(low[p], low[q]);
          if (low[q] >= dfn[p]) newBCC(p, q);
        } else low[p] = min(low[p], dfn[q]);
      }
    }

    for (let i = 0; i < n; ++i) if (dfn[i] === 0) dfs1(i);

    return res;
  }

  report(): NodeEdgeList {
    let resNodes: Node[] = [];
    let resEdges: Edge[] = [];
    let nodeList: number[];
    let tempGraph: NodeEdgeList;

    for (let graph of this.graphs) {
      tempGraph = graph.reMap(resNodes.length);
      resNodes = resNodes.concat(tempGraph.nodes());
      resEdges = resEdges.concat(tempGraph.edges());
    }

    return new NodeEdgeList(resNodes, resEdges);
  }

  *test(G: DMPGraph, quickTest: boolean) {
    G.simplify();
    yield { graph: this.report() };

    //console.table(G.nodes().map(n=>n.datum.displayId));

    let V = G.nodes(),
      E = G.edges();
    let n = V.length,
      m = E.length;
    if (n === 0 || m === 0) return true;
    if (quickTest && (n < 5 || m < 9)) return true;
    if (quickTest && m > 3 * n - 6) return false;

    let faces: Face[] = [];
    let fragments: Fragment[] = [];

    function embed(e: Edge) {
      e.datum.tag = V[e.source].datum.tag = V[e.target].datum.tag = 2;
    }

    function getFragment(e: Edge): Fragment {
      let visit: boolean[] = [];
      let nNodesId: number[] = [];
      let cNodesId: number[] = [];
      clear(visit, false, n);

      function dfs2(p: number) {
        visit[p] = true;
        if (V[p].datum.tag === 2) {
          cNodesId.push(p);
          return;
        } else nNodesId.push(p);
        for (let {
          target: q,
          datum: { id: i }
        } of G.adjacentEdges(p)) {
          if (E[i].datum.tag !== 0) continue;
          E[i].datum.tag = 1;
          if (!visit[q]) dfs2(q);
        }
      }

      e.datum.tag = 1;
      dfs2(e.source), dfs2(e.target);

      let res = new Fragment(nNodesId, cNodesId);
      faces.forEach((face, i) => {
        if (face.check(cNodesId)) res.validFacesId.push(i);
      });

      return res;
    }

    function getPath(f: Fragment): number[] {
      let res: number[] = [];
      let vis: boolean[] = [];
      clear(vis, true, n);
      f.nodesId().forEach(i => (vis[i] = false));

      function dfs3(p: number, fir: boolean = false): boolean {
        vis[p] = true;
        if (!fir && V[p].datum.tag === 2) {
          res.push(p);
          return true;
        }
        for (let {
          target: q,
          datum: { id: i }
        } of G.adjacentEdges(p)) {
          if (vis[q] || E[i].datum.tag === 2) continue;
          if (dfs3(q)) {
            embed(E[i]), res.push(p);
            return true;
          }
        }
        return false;
      }

      dfs3(f.cNodesId[0], true);

      return res;
    }

    // init face
    embed(E[0]), faces.push(new Face([E[0].source, E[0].target]));

    while (faces.length < m - n + 2) {
      E.forEach(e => {
        if (e.datum.tag !== 2) e.datum.tag = 0;
      });
      fragments = [];

      E.forEach(e => {
        if (e.datum.tag !== 0) return;
        fragments.push(getFragment(e));
      });

      //console.log(G);
      //faces.forEach(f=>console.log(f));
      //fragments.forEach(f=>console.log(f));

      if (fragments.some(f => f.validFacesId.length === 0)) return false;

      let fragmentId = 0;
      fragments.every((f, i) => {
        if (f.validFacesId.length === 1) {
          fragmentId = i;
          return false;
        }
      });

      let fragment = fragments[fragmentId];
      let faceId = fragment.validFacesId[0];
      let face = faces[faceId];

      G.mark(fragment.nodesId());
      yield { graph: this.report() };
      G.clearMark();

      let path: number[] = getPath(fragment);

      //console.log(path);

      let nodeList1: number[] = [];
      let nodeList2: number[] = [];
      let pos1 = face.nodesId.findIndex(i => i === path[0]);
      let pos2 = face.nodesId.findIndex(i => i === path[path.length - 1]);
      let tot = face.nodesId.length;
      for (let i of path) nodeList1.push(i), nodeList2.push(i);
      for (let i = (pos2 + 1) % tot; i != pos1; i = (i + 1) % tot) nodeList1.push(face.nodesId[i]);
      for (let i = (tot + pos2 - 1) % tot; i != pos1; i = (tot + i - 1) % tot) nodeList2.push(face.nodesId[i]);

      faces = faces.filter((_, i) => i !== faceId);
      faces.push(new Face(nodeList1));
      faces.push(new Face(nodeList2));
    }

    return true;
  }

  *run(G: Graph, quickTest: boolean = false): Generator<Step> {
    let planarity: boolean = true;
    let graph = DMPGraph.from(G);
    graph.simplify();
    graph.active();
    yield { graph };

    this.graphs = this.split(graph);
    yield { graph: this.report() };

    for (let g of this.graphs) {
      g.active();
      yield { graph: this.report() };

      if (!(yield* this.test(g, quickTest))) planarity = false;
      //console.log(`graph: ${graph}\nresult: ${planarity}`);

      g.active(false);
      if (quickTest && !planarity) break;
    }

    yield { graph: this.report() };

    return { planarity };
  }
}

export { DMP };

import { GraphAlgorithm, Step } from "../GraphAlgorithm";
import { AdjacencyList, BipartiteGraph, Graph, Node, NodeEdgeList } from "../GraphStructure";

class BGM extends GraphAlgorithm {
  constructor() {
    super("BGM", "Biregular Graph Match");
  }

  dfs(node: Node, edges: AdjacencyList): boolean {
    return edges.adjacentEdges(node.id).some(({ target: t }) => {
      let tn = edges.nodes()[t], td = tn.datum;
      if (!td.visit) {
        td.visit = true;
        if (td.match === -1 || this.dfs(edges.nodes()[td.match], edges)) {
          td.match = node.id;
          node.datum.match = tn.id;
          td.tag = node.datum.tag = 1;
          return true;
        }
      }
    });
  }

  * run(graph: Graph): Generator<Step> {
    if (!(graph instanceof BipartiteGraph)) throw new Error();
    let adjlist = AdjacencyList.from(graph, false);
    let nodes = graph.nodes(), edges = graph.edges(), nc = nodes.length;
    let left = graph.leftSide, right = graph.rightSide;
    nodes.forEach(node => Object.assign(node.datum, { tag: 0, match: -1 }));
    edges.map(edge => nodes[edge.source].datum.side === "left" ? edge : ({
      source: edge.target,
      target: edge.source,
      datum: edge.datum
    }));

    for (let leftNode of left) {
      right.forEach(node => node.datum.visited = false);
      if (!this.dfs(leftNode, adjlist)) {
        leftNode.datum.tag = 2;
      }
      edges.forEach(edge => edge.datum.matched = nodes[edge.source].datum.match === edge.target);
      yield { graph: new NodeEdgeList(nodes, edges) };
    }

    // let nc = graph.nodes(), ncL: number = 0;
    // let nodes: Node[] = graph.getNodeList();
    // let nL: number[] = [], nR: number[] = [];
    // let side: BiregularSide[] = [];
    // let tag: number[] = [];
    // let visit: boolean[] = [], match: number[] = [];
    //
    // let edges = new AdjacencyEdges(nc);
    //
    // nodes.forEach((n, i) => {
    //   side[i] = n.datum.side;
    //   tag[i] = 0;
    //   match[i] = -1;
    //   if (side[i] == BiregularSide.Left)
    //     ncL = nL.push(i);
    //   else nR.push(i);
    // });
    // graph.getEdgeList().forEach((e, i) => {
    //   // make sure it is a biregular graph.
    //   if (side[e.source] == side[e.target])
    //     throw new Error(`Edge ${e} is invalid.`);
    //   if (side[e.source] == BiregularSide.Left) edges.addEdge(e);
    //   else edges.addEdge(new Edge(e.target, e.source));
    // });
    //
    // for (let i = 0; i < ncL; ++i) {
    //   //console.log(nL[i]);
    //   nR.forEach((pR) => {
    //     visit[pR] = false;
    //   });
    //   if (!this.dfs(nL[i], edges, match, visit, tag))
    //     tag[nL[i]] = 2;
    //   let resEdges: Edge[] = [];
    //   edges.dst.forEach((d, psrc) => {
    //     d.forEach((pdst) => {
    //       resEdges.push(new Edge(psrc, pdst, new BGMEdgeDatum(match[pdst] == psrc, false)));
    //     });
    //   });
    //   let resGraph = new Graph(nc, (i: number) => new BGMNodeDatum(side[i], tag[i]), undefined, GraphOption.Simple, true);
    //   if (resGraph) yield new Step(resGraph);
    //   else throw new Error();
    // }
  }
}

export { BGM };


// int f[N],to[N*N],nt[N*N],a[N];
// bool visit[N];
// int dfs(int pos) {
//     for(int i=f[pos]; i; i=nt[i])
//     if(!visit[to[i]]) {
//         visit[to[i]]=1;
//         if(!a[to[i]]||dfs(a[to[i]])) {
//             a[to[i]]=pos;
//             return 1;
//         }
//     }
//     return 0;
// }
//     for(int i=1; i<=n; ++i) {
//         memset(vis,0,sizeof vis);
//         ans+=dfs(i);
//     }
//     printf("%d\n",ans);
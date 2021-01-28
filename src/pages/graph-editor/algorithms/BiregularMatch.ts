import {GraphAlgorithm, Step} from "../GraphAlgorithm";
import {AdjacencyEdges, BiregularNodeDatum, BiregularSide, Edge, Graph, GraphOption, Node} from "../GraphStructure";
import {DFSStep} from "@/pages/graph-editor/algorithms/DFS";

class BGMNodeDatum {
    constructor(
        public readonly side: BiregularSide,
        public readonly tag: number
    ) {
    }
}

class BGMEdgeDatum {
    constructor(
        public readonly matched: boolean,
        public readonly selected: boolean
    ) {
    }
}

export type BGMStep = Step<BGMNodeDatum, BGMEdgeDatum>;

class BGM extends GraphAlgorithm<BGMNodeDatum, BGMEdgeDatum, undefined> {
    constructor() {
        super("BGM", "Biregular Graph Match");
    }

    dfs(pos: number, edges: AdjacencyEdges, match: number[], visit: boolean[], tag: number[]): boolean {
        let res: boolean = false;
        edges.dst[pos].every((d, i) => {
            if (visit[d] == false) {
                visit[d] = true;
                if (match[d] == -1 || this.dfs(match[d], edges, match, visit, tag) == true) {
                    match[d] = pos;
                    tag[d] = tag[pos] = 1;
                    res = true;
                    return false;
                }
            }
        });
        return res;
    }

    //Yield step
    // let graph = Graph.fromAdjacencyMatrix<BGMNodeDatum, BGMEdgeDatum>(
    //     mat,
    //     true, true,
    //     i => ({
    //         dist: dist[i],
    //         prev: prev[i]
    //     }),
    //     v => ({weight: v})
    // );
    // if (graph) yield new Step(graph);
    // else throw new Error();

    * run(graph: Graph<BiregularNodeDatum, any>): Generator<BGMStep> {
        let nc = graph.getNodeCount(), ncL: number = 0;
        let nodes: Node<BiregularNodeDatum>[] = graph.getNodeList();
        let nL: number[] = [], nR: number[] = [];
        let side: BiregularSide[] = [];
        let tag: number[] = [];
        let visit: boolean[] = [], match: number[] = [];

        let edges = new AdjacencyEdges(nc);

        nodes.forEach((n, i) => {
            side[i] = n.datum.side;
            tag[i] = 0;
            match[i] = -1;
            if (side[i] == BiregularSide.Left)
                ncL = nL.push(i);
            else nR.push(i);
        })
        graph.getEdgeList().forEach((e, i) => {
            // make sure it is a biregular graph.
            if (side[e.source] == side[e.target])
                throw new Error(`Edge ${e} is invalid.`);
            if (side[e.source] == BiregularSide.Left) edges.addEdge(e);
            else edges.addEdge(new Edge<any>(e.target, e.source));
        })

        for (let i = 0; i < ncL; ++i) {
            //console.log(nL[i]);
            nR.forEach((pR) => {
                visit[pR] = false;
            });
            if (!this.dfs(nL[i], edges, match, visit, tag))
                tag[nL[i]] = 2;
            let resEdges: Edge<BGMEdgeDatum>[] = [];
            edges.dst.forEach((d, psrc) => {
                d.forEach((pdst) => {
                    resEdges.push(new Edge<BGMEdgeDatum>(psrc, pdst, new BGMEdgeDatum(match[pdst] == psrc, false)));
                });
            });
            let resGraph = new Graph(nc, (i: number) => new BGMNodeDatum(side[i], tag[i]), undefined, GraphOption.Simple, true);
            if (resGraph) yield new Step(resGraph);
            else throw new Error();
        }
    }


}

export {BGMNodeDatum, BGMEdgeDatum, BGM};


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
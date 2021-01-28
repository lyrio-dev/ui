import {BGM} from "./BiregularMatch";
import {BiregularNodeDatum, BiregularSide, Edge, Graph} from "../GraphStructure";

test("bgm", () => {
    let edges:Edge<undefined>[]=[];
    edges.push(new Edge<undefined>(0,3));
    edges.push(new Edge<undefined>(0,4));
    edges.push(new Edge<undefined>(0,5));
    edges.push(new Edge<undefined>(1,5));
    edges.push(new Edge<undefined>(2,5));
    let graph = new Graph<BiregularNodeDatum, any>(6,
        (i) => new BiregularNodeDatum(i < 3 ? BiregularSide.Left : BiregularSide.Right),edges);
    let bgm = new BGM();
    if (graph === null)
        throw new Error();
    else {
        let steps = Array
            .from(bgm.run(graph))
            .map(s => s.graph.getNodeList())
            .map(nl => nl.map(n => n.datum.tag));
        console.table(steps);
    }
})
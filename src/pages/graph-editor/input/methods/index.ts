import RandomGraphComponent from "@/pages/graph-editor/input/methods/RandomGraphComponent";
import AdjacencyMatrixComponent from "@/pages/graph-editor/input/methods/AdjacencyMatrixComponent";

const methods = new Map([
  ["random", RandomGraphComponent],
  ["adjmat", AdjacencyMatrixComponent]
]);

export default methods;

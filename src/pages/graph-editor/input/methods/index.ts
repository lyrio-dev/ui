import RandomGraphComponent from "@/pages/graph-editor/input/methods/RandomGraphComponent";
import AdjacencyMatrixComponent from "@/pages/graph-editor/input/methods/AdjacencyMatrixComponent";
import IncidenceMatrixComponent from "@/pages/graph-editor/input/methods/IncidenceMatrixComponent";

const methods = new Map([
  ["random", RandomGraphComponent],
  ["adjmat", AdjacencyMatrixComponent],
  ["incmat", IncidenceMatrixComponent]
]);

export default methods;

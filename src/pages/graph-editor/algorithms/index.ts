import { GraphAlgorithm } from "@/pages/graph-editor/GraphAlgorithm";
import { Dijkstra } from "@/pages/graph-editor/algorithms/Dijkstra";
import codeMap from "./codeMap";

const algorithms = new Map<string, () => GraphAlgorithm>([["dijkstra", () => new Dijkstra()]]);

export { algorithms, codeMap };

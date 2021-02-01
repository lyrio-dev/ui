import { Graph } from "./GraphStructure";

class Step {
  constructor(
    public readonly graph: Graph,
    public readonly dcPosition?: Map<string, number>
  ) {
  }
}

abstract class GraphAlgorithm {

  protected constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly displayedCode?: Map<string, string[]>
  ) {
  }

  abstract run(graph: Graph, ...args: any[]): Generator<Step>;
}

export { Step, GraphAlgorithm };
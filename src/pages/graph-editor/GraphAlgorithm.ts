import { Graph } from "./GraphStructure";

interface ParameterDescriptor{
  readonly name: string;
  readonly parser: (text: string, graph: Graph) => any;
}

class Step {
  constructor(public readonly graph: Graph, public readonly codePosition?: Map<string, number>) {}
}

abstract class GraphAlgorithm {
  abstract id(): string;

  parameters(): ParameterDescriptor[] {
    return [];
  }

  abstract run(graph: Graph, ...args: any[]): Generator<Step>;
}

export { Step, GraphAlgorithm };

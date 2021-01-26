import { Graph } from "./GraphStructure";

class Step<NodeDatum, EdgeDatum> {
  constructor(
    public readonly graph: Graph<NodeDatum, EdgeDatum>,
    public readonly dcPosition?: Map<string, number>
  ) {
  }
}

abstract class GraphAlgorithm<NodeDatum, EdgeDatum, ResultType> {
  protected result?: ResultType;

  protected constructor(
    public readonly name: string,
    public readonly description?: string,
    public readonly displayedCode?: Map<string, string[]>
  ) {
  }

  abstract run(graph: Graph<any, any>, ...args: any[]): Generator<Step<NodeDatum, EdgeDatum>>;

  getResult() {
    return this.result;
  }
}

export { Step, GraphAlgorithm };
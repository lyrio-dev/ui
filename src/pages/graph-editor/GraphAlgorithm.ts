import { Graph } from "./GraphStructure";

export function isInteger(v: number): boolean {
  return Math.floor(v) === v;
}

// check if res = Number(text) is an integer and res \in [lowerbound, upperbound)
export function parseRangedInt(text: string, lowerbound: number, upperbound: number): number {
  let res = Number(text);
  if (isNaN(res) || !isInteger(res)) throw new Error(".input.error.not_an_integer");
  if (res < lowerbound || res >= upperbound) throw new Error(".input.error.out_of_range");
  return res;
}

export interface ParameterDescriptor {
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

export { GraphAlgorithm, Step };

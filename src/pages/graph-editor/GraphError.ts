import { useLocalizer } from "@/utils/hooks";

const _ = useLocalizer();

export default class GraphError extends Error {
  constructor(foo = "bar", ...params) {
    super(...params);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GraphError);
    }
    this.name = "GraphError";
  }
}

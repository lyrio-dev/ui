import React, { useState } from "react";
import { Form, Message } from "semantic-ui-react";
import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { AdjacencyMatrix, Graph } from "@/pages/graph-editor/GraphStructure";
import { useLocalizer } from "@/utils/hooks";

let AdjacencyMatrixComponent: MethodComponent = props => {
  const _ = useLocalizer("graph_editor");
  let { graph, setGraph } = props;
  const [directed, setDirected] = useState<boolean>(true);
  const [weighted, setWeighted] = useState<boolean>(false);
  const [error, _setError] = useState<string>();
  const setError = e => {
    if (e !== error) _setError(e);
  };
  const toString = (g: Graph) => {
    try {
      let graph = AdjacencyMatrix.from(g, directed);
      return graph.mat
        .map(line =>
          line
            .map(datum => {
              if (datum === undefined) return "0";
              if (datum.weight === undefined) return "1";
              return String(datum.weight);
            })
            .join(" ")
        )
        .join("\n");
    } catch (e) {
      setError(e.message);
    }
  };
  const [content, setContent] = useState<string>(toString(graph));
  const onDirectedChanged = (_, { checked }) => {
    setDirected(checked);
    setContent(toString(graph));
    setError(undefined);
  };
  const onWeightedChanged = (_, { checked }) => {
    setWeighted(checked);
    setContent(toString(graph));
    setError(undefined);
  };
  const onTextAreaChange = (_, { value }) => setContent(String(value));
  const onFormSubmit = () => {
    try {
      let mat: any[][] = content
        .trim()
        .split("\n")
        .map(line =>
          line
            .trim()
            .split(/\s+/)
            .map(s => parseInt(s))
            .map(v => {
              if (isNaN(v)) throw new Error(".input.error.nan");
              if (v === 0) return undefined;
              if (weighted) return { weight: v };
              if (v !== 1) throw new Error(".input.error.zero_or_one");
              return {};
            })
        );
      let graph = new AdjacencyMatrix(mat, directed);
      setGraph(graph);
      setError(undefined);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Form onSubmit={onFormSubmit} error={error !== undefined}>
      <Form.TextArea style={{ fontFamily: "monospace" }} value={content} onChange={onTextAreaChange} />
      <Form.Group inline>
        <Form.Checkbox label={"Directed?"} checked={directed} onChange={onDirectedChanged} />
        <Form.Checkbox label={"Weighted?"} checked={weighted} onChange={onWeightedChanged} />
      </Form.Group>
      {error && <Message error>{_(error)}</Message>}
      <Form.Button positive>Sync</Form.Button>
    </Form>
  );
};

export default AdjacencyMatrixComponent;

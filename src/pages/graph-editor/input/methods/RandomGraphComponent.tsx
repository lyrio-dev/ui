import { MethodComponent } from "@/pages/graph-editor/input/GraphInputPanel";
import { Form, Message } from "semantic-ui-react";
import React, { useState } from "react";
import { useLocalizer } from "@/utils/hooks";
import { fromRandom } from "@/pages/graph-editor/GraphStructure";

let RandomGraphComponent: MethodComponent = props => {
  const _ = useLocalizer("graph_editor");
  let { graph, setGraph } = props;
  const [error, setError] = useState<string>();

  const useNumberState: (initialState: number) => [number, (_, data) => void] = initialState => {
    const [state, setState] = useState(initialState);
    return [
      state,
      (_, { value }) => {
        const numberValue = value ? parseInt(value) : 0;
        if (isNaN(numberValue)) {
          setError(".input.error.nan");
        } else {
          setState(numberValue);
          setError(undefined);
        }
      }
    ];
  };
  const useBooleanState: (initialState: boolean) => [boolean, (_, data) => void] = initialState => {
    const [state, setState] = useState(initialState);
    return [
      state,
      (_, { checked }) => {
        setState(checked);
      }
    ];
  };
  const firstLine: [string, number, (_, data) => void][] = ([
    ["Node Count", 10],
    ["Edge Count", 20],
    ["Max Weight", 100]
  ] as [string, number][]).map(([name, init]) => [name, ...useNumberState(init)]);
  const secondLine: [string, boolean, (_, data) => void][] = ([
    ["Directed?", true],
    ["MultipleEdges?", false],
    ["SelfLoop?", false],
    ["Weighted?", false]
  ] as [string, boolean][]).map(([name, init]) => [name, ...useBooleanState(init)]);

  const onFormSubmit = () => {
    setGraph(
      fromRandom(
        firstLine[0][1],
        firstLine[1][1],
        secondLine[0][1],
        secondLine[1][1],
        secondLine[2][1],
        secondLine[3][1],
        undefined,
        () => Math.floor(Math.random() * firstLine[2][1])
      )
    );
  };

  return (
    <Form onSubmit={onFormSubmit} error={error !== undefined}>
      <Form.Group widths={"equal"}>
        {firstLine.map(([name, state, setter]) => (
          <Form.Input key={name} label={name} value={String(state)} onChange={setter} />
        ))}
      </Form.Group>
      <Form.Group inline>
        {secondLine.map(([name, state, setter]) => (
          <Form.Checkbox key={name} label={name} checked={state} onChange={setter} />
        ))}
      </Form.Group>
      {error && <Message error>{_(error)}</Message>}
      <Form.Button positive>Sync</Form.Button>
    </Form>
  );
};

export default RandomGraphComponent;

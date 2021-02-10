import React, { useState } from "react";
import { Form, Message } from "semantic-ui-react";
import { useLocalizer } from "@/utils/hooks";
import { CheckboxProps } from "semantic-ui-react/dist/commonjs/modules/Checkbox/Checkbox";

interface MatrixInputProps {
  initContent: string;
  initError?: string;
  options: [string, boolean][];
  onSync: (mat: number[][], options: boolean[]) => void;
}

let MatrixInputComponent: React.FC<MatrixInputProps> = props => {
  const _ = useLocalizer("graph_editor");
  let { initContent, initError, options, onSync } = props;
  const [content, setContent] = useState<string>(initContent);
  const [error, _setError] = useState<string>(initError);
  const setError = e => {
    if (e !== error) _setError(e);
  };
  let optionStates: [string, boolean, (event: any, data: CheckboxProps) => void][] = options
    .map<[any, any, (v: boolean) => void]>(([name, init]) => [name, ...useState<boolean>(init)])
    .map(state => [
      state[0],
      state[1],
      (_, { checked }) => {
        state[2](checked);
        setError(undefined);
      }
    ]);
  const onTextAreaChange = (_, { value }) => setContent(String(value));
  const onFormSubmit = () => {
    const parseIntWithThrow = v => {
      let n = parseInt(v);
      if (isNaN(n)) throw new Error(".input.error.nan");
      return n;
    };
    try {
      let mat = content
        .trim()
        .split("\n")
        .map(line =>
          line
            .trim()
            .split(/\s+/)
            .map(s => parseIntWithThrow(s))
        );
      onSync(
        mat,
        optionStates.map(state => state[1])
      );
      setError(undefined);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <Form onSubmit={onFormSubmit} error={error !== undefined}>
      <Form.TextArea style={{ fontFamily: "monospace" }} value={content} onChange={onTextAreaChange} />
      <Form.Group inline>
        {optionStates.map(([name, option, setter]) => (
          <Form.Checkbox key={name} label={name} checked={option} onChange={setter} />
        ))}
      </Form.Group>
      {error && <Message error>{_(error)}</Message>}
      <Form.Button positive>Sync</Form.Button>
    </Form>
  );
};

export default MatrixInputComponent;

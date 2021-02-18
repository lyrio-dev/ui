import { Button, Comment, Dropdown, Grid, Header, Placeholder, Segment } from "semantic-ui-react";
import React, { useState } from "react";
import { algorithms, codeMap } from "@/pages/graph-editor/algorithms";
import MarkdownContent from "@/markdown/MarkdownContent";
import { useLocalizer } from "@/utils/hooks";
import { GraphAlgorithm, Step } from "@/pages/graph-editor/GraphAlgorithm";

let AlgorithmControl: React.FC = props => {
  const _ = useLocalizer("graph_editor");

  const [auto, setAuto] = useState(false);
  const [algorithm, setAlgorithm] = useState<string>();
  const [codeType, setCodeType] = useState<string>();
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepCount, setStepCount] = useState(0);
  const [runner, setRunner] = useState<GraphAlgorithm>();
  const [stepGenerator, setStepGenerator] = useState<Generator<Step>>();

  const flipAuto = () => setAuto(!auto);
  const mapCodeLines = (outerIndexes: number[]) => (e, i) => (
    <Comment key={i}>
      {typeof e === "string" ? (
        <>
          <Comment.Text>
            <MarkdownContent content={e} />{" "}
          </Comment.Text>
        </>
      ) : (
        <Comment.Group>{e.map(mapCodeLines([...outerIndexes, i]))}</Comment.Group>
      )}
    </Comment>
  );
  const reset = () => {
    setSteps([]);
    setStepCount(0);
    setRunner(null);
    setStepGenerator(null);
  };
  const onAlgorithmChanged = (_, { value }) => {
    setAlgorithm(value);
    reset();
  };
  const onCodeTypeChanged = (_, { value }) => {
    setCodeType(value);
    reset();
  };
  const nextStep = () => {
    if(runner == null) {

    }
  }

  return (
    <>
      <Header as="h4" block attached="top" icon="terminal" content="algorithm" />
      <Segment attached="bottom">
        <Grid padded>
          <Grid.Row>
            <Grid.Column width={16}>
              {algorithm && codeType ? (
                <Comment.Group>{codeMap[algorithm][codeType].map(mapCodeLines([]))}</Comment.Group>
              ) : (
                <Placeholder>
                  {Array.from({ length: 7 }, (_, i) => (
                    <Placeholder.Line key={i} />
                  ))}
                </Placeholder>
              )}
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}>
              <Dropdown
                placeholder="Select Algorithm"
                fluid
                search
                selection
                options={[...algorithms.keys()].map(key => ({
                  key,
                  text: _(`.algo.${key}.name`),
                  value: key
                }))}
                onChange={onAlgorithmChanged}
              />
            </Grid.Column>
            <Grid.Column width={3}>
              <Dropdown
                placeholder="Select Code Type"
                fluid
                search
                selection
                options={
                  algorithm
                    ? Object.keys(codeMap[algorithm]).map(key => ({
                      key,
                      text: _(`.algo.code_type.${key}`),
                      value: key
                    }))
                    : []
                }
                onChange={onCodeTypeChanged}
              />
            </Grid.Column>
            <Grid.Column width={3}>
              <Button
                fluid
                labelPosition="left"
                icon="terminal"
                content={stepCount === 0 ? "Not running" : `${stepCount} Step`}
              />
            </Grid.Column>
            <Grid.Column width={7}>
              <Button.Group fluid>
                <Button labelPosition="left" icon="left chevron" content="Back" />
                {auto ? (
                  <Button icon="pause" content="Stop" onClick={flipAuto} />
                ) : (
                  <Button icon="play" content="Start" onClick={flipAuto} />
                )}
                <Button labelPosition="right" icon="right chevron" content="Forward" />
              </Button.Group>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </>
  );
};

export default AlgorithmControl;

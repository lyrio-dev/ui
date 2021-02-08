import React from "react";
import { Header, Segment } from "semantic-ui-react";
import { Graph } from "@/pages/graph-editor/GraphStructure";
import AdjacencyMatrixComponent from "@/pages/graph-editor/input/methods/AdjacencyMatrixComponent";

export interface MethodComponentProps {
  graph: Graph;
  setGraph: (g: Graph) => void;
}

export interface MethodComponent extends React.FC<MethodComponentProps> {
}

interface GraphInputPanelProps {
  graph: Graph;
  setGraph: (g: Graph) => void;
  error?: string;
}

let GraphInputPanel: React.FC<GraphInputPanelProps> = props => {

  return (
    <>
      <Header as="h4" block attached="top" icon="edit" content="图的表示方法" />
      {/*<Segment attached="bottom">*/}
      {/*  <Menu attached="top" tabular>*/}
      {/*    <Menu.Item>hello</Menu.Item>*/}
      {/*{this.props.inputMethods.map(([id, name]) => (*/}
      {/*  <Menu.Item key={id} name={id} active={this.state.activeMethod === id} onClick={this.handleItemClick}>*/}
      {/*    {name}*/}
      {/*  </Menu.Item>*/}
      {/*))}*/}
      {/*</Menu>*/}
      <Segment attached="bottom">
        <AdjacencyMatrixComponent graph={props.graph} setGraph={(g) => props.setGraph(g)} />
      </Segment>
      {/*</Segment>*/}
    </>
  );
};

export default GraphInputPanel;
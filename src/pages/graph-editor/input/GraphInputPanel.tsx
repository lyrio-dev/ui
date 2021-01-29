import React from "react";
import { Form, Header, Menu, Message, Segment } from "semantic-ui-react";
import { Graph } from "@/pages/graph-editor/GraphStructure";

interface GraphInputPanelProps {
  inputMethods: [string, string, (graph: Graph) => string | undefined][],
  onInputChanged: (method: string, content: string) => void,
  graph: Graph,
  error?: string
}

interface GraphInputPanelState {
  activeMethod: string,
  textAreaContent: string,
}

export default class GraphInputPanel extends React.Component<GraphInputPanelProps, GraphInputPanelState> {

  state = {
    activeMethod: this.props.inputMethods[0][0],
    textAreaContent: this.props.inputMethods[0][2](this.props.graph)
  };

  handleItemClick = (_, { name }) => this.setState({ activeMethod: name });

  onTextAreaChange = (_, { value }) => this.setState({ textAreaContent: String(value) });

  onFormSubmit = () => {
    let { activeMethod, textAreaContent } = this.state;
    this.props.onInputChanged(activeMethod, textAreaContent);
  };

  render() {
    return (
      <>
        <Header as="h4" block attached="top" icon="edit" content="图的表示方法" />
        <Segment attached="bottom">
          <Menu attached="top" tabular>
            {
              this.props.inputMethods.map(
                ([id, name]) => (
                  <Menu.Item
                    key={id}
                    name={id}
                    active={this.state.activeMethod === id}
                    onClick={this.handleItemClick}
                  >
                    {name}
                  </Menu.Item>
                )
              )
            }
          </Menu>
          <Segment attached="bottom">
            <Form onSubmit={this.onFormSubmit} error={this.props.error !== undefined}>
              <Form.TextArea
                style={{ "fontFamily": "monospace" }}
                value={this.state.textAreaContent}
                onChange={this.onTextAreaChange}
              />
              {
                this.props.error && (
                  <Message error>
                    {this.props.error}
                  </Message>
                )
              }
              <Form.Button positive>Sync</Form.Button>
            </Form>
          </Segment>
        </Segment>
      </>
    );
  }
}
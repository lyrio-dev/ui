import React from "react";
import { Button, Form, Grid, Header, Menu, Message, Segment, TextArea } from "semantic-ui-react";

interface GraphInputPanelProps {
  inputMethods: [string, string][],
  onInputChanged: (method: string, content: string) => string | undefined,
  getGraphAs: (method: string) => string | undefined
}

interface GraphInputPanelState {
  activeMethod: string,
  textAreaContent: string,
  errorMessage?: string
}

export default class GraphInputPanel extends React.Component<GraphInputPanelProps, GraphInputPanelState> {

  state = {
    activeMethod: this.props.inputMethods[0][0],
    textAreaContent: this.props.getGraphAs(this.props.inputMethods[0][0]),
    errorMessage: undefined
  };

  handleItemClick = (_, { name }) => this.setState({ activeMethod: name });

  onTextAreaChange = (_, { value }) => this.setState({ textAreaContent: String(value) });

  onFormSubmit = () => {
    let { activeMethod, textAreaContent } = this.state;
    this.props.onInputChanged(activeMethod, textAreaContent);
  };

  render() {
    console.log(this.state.textAreaContent);
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
            <Form onSubmit={this.onFormSubmit}>
              <Form.TextArea className={"monospace"} value={this.state.textAreaContent} onChange={this.onTextAreaChange} />
              {
                this.state.errorMessage && (
                  <Message error>
                    {this.state.errorMessage}
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
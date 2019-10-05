import React from "react";
import { connect } from "dva";
import { formatMessage } from "umi/locale";

@connect()
class IndexPage extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: "app/setTitle",
      payload: {
        title: formatMessage({ id: "syzoj.index.title" })
      }
    });
  }

  render() {
    return "Hello, world!";
  }
}

export default IndexPage;

import React from "react";
import ReactDOM from "react-dom";
import "./index.less";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

import initApp from "./initApp";

class ErrorBoundary extends React.Component<{}, { hasError: boolean }> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    window.fatalError(
      ["There's a fatal error in the application. It may be a bug.", "应用程序遇到致命错误，这可能是一个 Bug。"],
      error.stack
    );
  }

  render() {
    if (this.state.hasError) return <></>;
    return this.props.children;
  }
}

initApp()
  .then(() => {
    ReactDOM.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>,
      document.getElementById("root")
    );
  })
  .catch(err => {
    window.fatalError(
      [
        "There's an error initializing the application. It may be a bug or network issue.",
        "初始化应用程序时出错，这可能是一个 Bug 或网络故障。"
      ],
      err.stack
    );
  });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

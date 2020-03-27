declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  import * as React from "react";

  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module "*.wasm" {
  const url: string;
  export default url;
}

interface Window {
  appConfig: {
    siteName: string;
    apiEndpoint: string;
    crossOrigin: boolean;
  };

  fatalError(messages: string[], stack?: string): void;
}

/// <reference types="react-scripts" />

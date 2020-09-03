declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

  const dataUrl: string;
  export default dataUrl;
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

  // For get session info JSONP API
  sessionInfo: ApiTypes.GetSessionInfoResponseDto;
  getSessionInfoCallback: (sessionInfo: ApiTypes.GetSessionInfoResponseDto) => void;
  refreshSession: (tokan: string) => void;
}

/// <reference types="react-scripts" />

declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.url.css" {
  const url: string;
  export default url;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.wasm" {
  const url: string;
  export default url;
}

interface Window {
  publicPath: string;
  apiEndpoint: string;
  appLogo: string;
  gravatarCdn: string;
  twemojiCdn: string;
  appVersion: {
    hash?: string;
    date?: string;
  };

  fatalError(messages: string[], stack?: string): void;

  // For get session info JSONP API
  sessionInfo: ApiTypes.GetSessionInfoResponseDto;
  getSessionInfoCallback: (sessionInfo: ApiTypes.GetSessionInfoResponseDto) => void;
  refreshSession: (tokan: string) => void;
}

/// <reference types="react-scripts" />

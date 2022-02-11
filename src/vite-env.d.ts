/// <reference types="vite/client" />
/// <reference types="vite-plugin-compile-time/client" />

// Extending Window object

interface Window {
  publicPath: string;
  apiEndpoint: string;
  appLogo: string;
  gravatarCdn: string;
  ghAvatarCdn: string;
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

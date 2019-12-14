export interface AppConfig {
  siteName: string;
  apiEndpoint: string;
  crossOrigin: boolean;
}

export const appConfig: AppConfig = (window as any)._appConfig;

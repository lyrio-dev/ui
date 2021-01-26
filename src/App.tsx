import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

import { appState } from "./appState";
import { updateCodeFontCss, updateContentFontCss, updateUiFontCss } from "./misc/fonts";
import { setGlobalTheme } from "./themes";

import AppRouter from "./AppRouter";

const App: React.FC = () => {
  useEffect(() => {
    updateCodeFontCss(appState.locale);
    updateContentFontCss(appState.locale);
    updateUiFontCss(appState.locale);
  }, [appState.userPreference.font, appState.locale]);

  useEffect(() => {
    setGlobalTheme(appState.theme);
  }, [appState.theme]);

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <meta
            name="viewport"
            content={appState.responsiveLayout ? "width=device-width, initial-scale=1, maximum-scale=1" : "width=1024"}
          />
          <title>
            {appState.title && `${appState.title} - `}
            {appState.serverPreference.siteName}
          </title>
        </Helmet>
      </HelmetProvider>
      <AppRouter />
    </>
  );
};

export default observer(App);

import React, { useEffect } from "react";
import { observer } from "mobx-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

import { appState } from "./appState";
import { availableCodeFonts } from "./webfonts";

import AppRouter from "./AppRouter";

const App: React.FC = () => {
  useEffect(() => {
    const ID = "font-preference";

    const style = document.createElement("style");
    style.innerHTML = `
      .monospace, code, pre {
        font-family: "${
          appState.userPreference.font?.codeFontFace || availableCodeFonts[0] || "monospace"
        }", monospace !important;
        font-size: ${appState.userPreference.font?.codeFontSize || 14}px !important;
        line-height: ${appState.userPreference.font?.codeLineHeight || 1.3} !important;
        font-variant-ligatures: ${
          appState.userPreference.font?.codeFontLigatures === false ? "none" : "normal"
        } !important;
      }
    `;
    style.id = ID;

    const oldStyle = document.getElementById(ID);
    if (oldStyle) document.head.replaceChild(style, oldStyle);
    else document.head.appendChild(style);
  }, [appState.userPreference.font]);

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

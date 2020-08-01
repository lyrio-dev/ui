import React from "react";
import { observer } from "mobx-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

import { appConfig } from "./appConfig";
import { appState } from "./appState";

import AppRouter from "./AppRouter";

const App: React.FC = () => {
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

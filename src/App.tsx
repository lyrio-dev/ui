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
          <title>
            {appState.title} - {appConfig.siteName}
          </title>
        </Helmet>
      </HelmetProvider>
      <AppRouter />
    </>
  );
};

export default observer(App);

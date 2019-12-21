import React from "react";
import { IntlProvider } from "react-intl";
import { observer } from "mobx-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

import { appConfig } from "./appConfig";
import { appState } from "./appState";
import { localeData } from "./locales";

import AppRouter from "./AppRouter";

const App: React.FC = () => {
  return (
    <IntlProvider locale={appState.localeHyphen} messages={localeData[appState.localeHyphen]}>
      <HelmetProvider>
        <Helmet>
          <title>
            {appState.title} - {appConfig.siteName}
          </title>
        </Helmet>
      </HelmetProvider>
      <AppRouter />
    </IntlProvider>
  );
};

export default observer(App);

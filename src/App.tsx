import React from "react";
import { ConfigProvider } from "antd";
import { IntlProvider } from "react-intl";
import { observer } from "mobx-react";
import { HelmetProvider, Helmet } from "react-helmet-async";

import { appConfig } from "./appConfig";
import { appState } from "./appState";
import { localeDataForAntd, localeDataForApp } from "./locales";

import AppRouter from "./AppRouter";

const App: React.FC = () => {
  return (
    <ConfigProvider autoInsertSpaceInButton={false} locale={localeDataForAntd[appState.locale]}>
      <IntlProvider locale={appState.locale} messages={localeDataForApp[appState.locale]}>
        <HelmetProvider>
          <Helmet>
            <title>
              {appState.title} - {appConfig.siteName}
            </title>
          </Helmet>
        </HelmetProvider>
        <AppRouter />
      </IntlProvider>
    </ConfigProvider>
  );
};

export default observer(App);

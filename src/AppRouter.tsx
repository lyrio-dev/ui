import React, { Suspense } from "react";
import { mount, lazy, withView } from "navi";
import { Router, View } from "react-navi";
import { IntlProvider } from "react-intl";

import AppLayout from "./layouts/AppLayout";
import getRoute from "./utils/getRoute";
import { appState } from "./appState";
import { loadLocaleData } from "./locales";

const routes = withView(
  async () => {
    const localeData = await loadLocaleData(appState.localeHyphen);
    return (
      <IntlProvider locale={appState.localeHyphen} messages={localeData}>
        <AppLayout>
          <View />
        </AppLayout>
      </IntlProvider>
    );
  },
  mount({
    "/": lazy(() => import("./pages/home")),
    "/login": lazy(() => import("./pages/login")),
    "/register": lazy(() => import("./pages/register")),
    "/problems": getRoute(() => import("./pages/problem"), "problems"),
    "/problem": getRoute(() => import("./pages/problem"), "problem"),
    "/submissions": getRoute(() => import("./pages/submission"), "submissions"),
    "/submission": getRoute(() => import("./pages/submission"), "submission"),
    "/users": getRoute(() => import("./pages/user"), "users"),
    "/user": getRoute(() => import("./pages/user"), "user"),
    "/judge-machine": lazy(() => import("./pages/judge-machine"))
  })
);

const AppRouter: React.FC = () => {
  return (
    <Router routes={routes}>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Router>
  );
};

export default AppRouter;

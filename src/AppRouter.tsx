import React, { Suspense, useMemo } from "react";
import { mount, lazy, withView, route, Resolvable, redirect, Matcher, map, NaviRequest } from "navi";
import { NotFoundBoundary, Router, View } from "react-navi";
import { IntlProvider } from "react-intl";
import { observer } from "mobx-react";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";

import AppLayout from "./layouts/AppLayout";
import ErrorPage, { ErrorPageProps } from "./pages/error/ErrorPage";
import getRoute from "./utils/getRoute";
import { appState } from "./appState";
import { loadLocaleData, makeToBeLocalizedText, ToBeLocalizedText } from "./locales";
import localeMeta from "./locales/meta";

export class RouteError implements ErrorPageProps {
  constructor(
    public message: React.ReactNode | ToBeLocalizedText,
    public options: {
      showRefresh?: true;
      showBack?: true;
    } = { showBack: true }
  ) {
  }
}

export function defineRoute(getViewFunction: (request: NaviRequest) => Promise<React.ReactNode>) {
  return map(async request => {
    try {
      const result = await getViewFunction(request);
      return typeof result === "function"
        ? (result as Matcher<any, any>)
        : route({
          view: result
        });
    } catch (e) {
      if (e instanceof RouteError)
        return route({
          view: <ErrorPage {...e} />
        });

      if (!(e instanceof Error)) e = new Error(String(e));
      return route({
        view: <ErrorPage uncaughtError={e} message={null} options={null} />
      });
    }
  });
}

class ErrorBoundary extends React.Component<{}, { hasError: boolean; error?: Error }> {
  constructor(props: unknown) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          uncaughtError={this.state.error}
          message={null}
          options={null}
          onRecover={() => this.setState({ hasError: false })}
        />
      );
    }

    return this.props.children;
  }
}

export function legacyRoutes(paths: Record<string, Matcher<any, any>>): Record<string, Matcher<any, any>> {
  return appState.serverPreference.misc.redirectLegacyUrls ? paths : {};
}

const AppRouter: React.FC = () => {
  const routes = useMemo(
    () =>
      withView(
        async () => {
          const localeHyphen = appState.locale.replace("_", "-");
          const localeData = await loadLocaleData(appState.locale);
          const elements = (
            <IntlProvider locale={localeHyphen} messages={localeData}>
              <AppLayout key={localeHyphen}>
                <ErrorBoundary>
                  <NotFoundBoundary
                    render={() => (
                      <ErrorPage message={makeToBeLocalizedText("common.invalid_url")} options={{ showBack: true }} />
                    )}
                  >
                    <View />
                  </NotFoundBoundary>
                </ErrorBoundary>
              </AppLayout>
            </IntlProvider>
          );

          return appState.serverPreference.security.recaptchaEnabled ? (
            <GoogleReCaptchaProvider
              reCaptchaKey={appState.serverPreference.security.recaptchaKey}
              language={localeMeta[appState.locale].recaptchaLanguageCode}
              useRecaptchaNet
            >
              {elements}
            </GoogleReCaptchaProvider>
          ) : (
            elements
          );
        },
        mount({
          "/": getRoute(() => import("./pages/home"), "home"),
          "/homepage-settings": getRoute(() => import("./pages/home"), "homeSettings"),
          "/login": lazy(() => import("./pages/auth/login")),
          "/register": lazy(() => import("./pages/auth/register")),
          "/forgot": lazy(() => import("./pages/auth/forgot")),
          "/p": getRoute(() => import("./pages/problem"), "p"),
          "/s": getRoute(() => import("./pages/submission"), "s"),
          "/u": getRoute(() => import("./pages/user"), "u"),
          "/user": getRoute(() => import("./pages/user"), "user"),
          "/groups": getRoute(() => import("./pages/user"), "groups"),
          "/d": getRoute(() => import("./pages/discussion"), "d"),
          "/judge-machine": lazy(() => import("./pages/judge-machine")),
          "/graph-editor": lazy(() => import("./pages/graph-editor")),
          ...legacyRoutes({
            "/problem": getRoute(() => import("./pages/problem"), "problem"),
            "/problems": getRoute(() => import("./pages/problem"), "problems"),
            "/submissions": redirect(request => ({ pathname: "/s", query: request.query })),
            "/submission/:id": redirect(request => `/s/${request.params.id}`),
            "/ranklist": redirect("/u"),
            "/discussion/global": redirect("/d"),
            "/discussion/problems": redirect("/d?problemId=all"),
            "/discussion/problem/:id": redirect(request => `/d?problemId=${request.params.id}`),
            "/article/0/edit": redirect("/d/new"),
            "/article/:id": redirect(request => `/d/${request.params.id}`),
            "/article/:id/edit": redirect(request => `/d/${request.params.id}/edit`)
          })
        })
      ),
    []
  );

  return (
    <Router routes={routes}>
      <Suspense fallback={null}>
        <View />
      </Suspense>
    </Router>
  );
};

export default observer(AppRouter);

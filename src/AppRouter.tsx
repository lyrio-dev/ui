import React, { Suspense } from "react";
import { mount, lazy } from "navi";
import { Router, View } from "react-navi";

import AppLayout from "./layouts/AppLayout";

const routes = mount({
  "/": lazy(() => import("./pages/home")),
  "/login": lazy(() => import("./pages/login")),
  "/register": lazy(() => import("./pages/register")),
  "/problems": lazy(() => import("./pages/problem-set")),
  "/problem": lazy(() => import("./pages/problem"))
});

const AppRouter: React.FC = () => {
  return (
    <Router routes={routes}>
      <AppLayout>
        <Suspense fallback={null}>
          <View />
        </Suspense>
      </AppLayout>
    </Router>
  );
};

export default AppRouter;

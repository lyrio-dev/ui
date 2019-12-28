import React, { Suspense } from "react";
import { mount, lazy } from "navi";
import { Router, View } from "react-navi";

import AppLayout from "./layouts/AppLayout";

const routes = mount({
  "/": lazy(() => import("./pages/home/HomePage")),
  "/login": lazy(() => import("./pages/login/LoginPage")),
  "/register": lazy(() => import("./pages/register/RegisterPage")),
  "/problems": lazy(() => import("./pages/problem-set/ProblemSetPage")),
  "/problem": lazy(() => import("./pages/problem/ProblemPage"))
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

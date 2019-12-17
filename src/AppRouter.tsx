import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/login/LoginPage";
import RegisterPage from "./pages/register/RegisterPage";
import ProblemSetPage from "./pages/problem-set/ProblemSetPage";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/problems" component={ProblemSetPage} />
          <Route path="/" component={HomePage} />
        </Switch>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;

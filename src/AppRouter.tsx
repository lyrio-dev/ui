import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";

import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/login/LoginPage";

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AppLayout>
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/" component={HomePage} />
        </Switch>
      </AppLayout>
    </BrowserRouter>
  );
};

export default AppRouter;

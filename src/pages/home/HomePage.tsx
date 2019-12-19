import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import { route } from "navi";

import { appState } from "@/appState";

const HomePage: React.FC = () => {
  const intl = useIntl();

  useEffect(() => {
    appState.title = intl.formatMessage({ id: "home.title" });
  });

  return <>Hello, world!</>;
};

export default route({
  view: <HomePage />
});

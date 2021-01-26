import React, { useEffect } from "react";
import { route } from "navi";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";

let Test: React.FC = prop => {
  const _ = useLocalizer("graph_editor");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  return <h1> hello world </h1>;
};

export default route({ view: <Test /> });
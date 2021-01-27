import React, { useEffect } from "react";
import { route } from "navi";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./display/GraphDisplay";
import GraphInputPanel from "./input/GraphInputPanel";
import { GraphBuilder, GraphOption } from "@/pages/graph-editor/GraphStructure";

let Test: React.FC = prop => {
  const _ = useLocalizer("graph_editor");

  let res = GraphBuilder.fromRandom(20, 100, GraphOption.Simple);
  if (res.error) return;
  let g = res.graph;

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  return (
    <>
      <GraphInputPanel
        inputMethods={[["adjmat", "邻接矩阵"]]}
        onInputChanged={undefined}
        getGraphAs={m => m === "adjmat" && g.toAdjacencyMatrix().map(l => l.join(" ")).join("\n")}
      />
      <GraphDisplay width={500} height={500} graph={g} />
    </>
  );
};

export default route({ view: <Test /> });
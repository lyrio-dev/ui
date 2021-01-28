import React, { useEffect, useState } from "react";
import { route } from "navi";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./display/GraphDisplay";
import GraphInputPanel from "./input/GraphInputPanel";
import { GraphBuilder, GraphOption } from "@/pages/graph-editor/GraphStructure";

let GraphEditor: React.FC = props => {
  let res = GraphBuilder.fromRandom(20, 100, GraphOption.Simple);
  if (res.error) throw new Error("Cannot generate graph");

  const [graph, setGraph] = useState(res.graph);
  const [error, setError] = useState<string>();
  const _ = useLocalizer("graph_editor");

  let onGraphInputPanelSync = (method: string, content: string) => {
    if (method === "adjmat") {
      let adjmat = content.split("\n").map(line => line.split(/\s+/).map(parseInt));
      let { graph, error } = GraphBuilder.fromAdjacencyMatrix(
        adjmat, false, false, undefined, undefined
      );
      if (error) setError(error);
      else {
        setGraph(graph);
        setError(undefined);
      }
    }
  };

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  return (
    <>
      <GraphInputPanel
        inputMethods={[["adjmat", "邻接矩阵", graph => graph.toAdjacencyMatrix().map(l => l.join(" ")).join("\n")]]}
        onInputChanged={onGraphInputPanelSync}
        graph={graph}
        error={error}
      />
      <GraphDisplay width={500} height={500} graph={graph} />
    </>
  );

};

export default route({ view: <GraphEditor /> });
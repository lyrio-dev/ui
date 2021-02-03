import React, { useEffect, useState } from "react";
import { route } from "navi";
import { useLocalizer } from "@/utils/hooks";
import { appState } from "@/appState";
import GraphDisplay from "./display/GraphDisplay";
import GraphInputPanel from "./input/GraphInputPanel";
import { AdjacencyMatrix, fromRandom } from "@/pages/graph-editor/GraphStructure";

let GraphEditor: React.FC = props => {
  let g = fromRandom(10, 15, true, false, false);

  const [graph, setGraph] = useState(g);
  const [error, setError] = useState<string>();
  const _ = useLocalizer("graph_editor");

  let onGraphInputPanelSync = (method: string, content: string) => {
    if (method === "adjmat") {
      let adjmat = content.split("\n").map(line => line.split(/\s+/).map(s => parseInt(s)));
      try {
        let graph = new AdjacencyMatrix(adjmat, true);
        setGraph(graph);
        setError(undefined);
      } catch (e) {
        setError(e.message);
      }
    }
  };

  useEffect(() => {
    appState.enterNewPage(_(".title"), "graph_editor");
  }, [appState.locale]);

  let cssProp = (key: string) => getComputedStyle(document.body).getPropertyValue(key);

  return (
    <>
      <GraphInputPanel
        inputMethods={[
          [
            "adjmat",
            "邻接矩阵",
            graph =>
              AdjacencyMatrix.from(graph, true)
                .mat.map(l => l.map(e => e ? "1" : "0").join(" "))
                .join("\n")
          ]
        ]}
        onInputChanged={onGraphInputPanelSync}
        graph={graph}
        error={error}
      />
      <GraphDisplay
        width={500}
        height={500}
        graph={graph}
        generalRenderHint={{
          directed: true,
          nodeRadius: 15,
          textColor: cssProp("--theme-foreground"),
          backgroundColor: cssProp("--theme-background"),
          simulationForceManyBodyStrength: -500
        }}
        nodeRenderHint={{
          borderThickness: () => 3,
          borderColor: () => cssProp("--theme-border"),
          fillingColor: () => cssProp("--theme-button-background"),
          floatingData: node => String(node.id),
          popupData: () => []
        }}
        edgeRenderHint={{
          thickness: () => 3,
          color: () => cssProp("--theme-hyperlink"),
          floatingData: () => ""
        }}
      />
    </>
  );
};

export default route({ view: <GraphEditor /> });

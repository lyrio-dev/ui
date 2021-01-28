import React from "react";
import * as d3 from "d3";
import { Node, Edge, Graph } from "../GraphStructure";
import { Force, SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Header, Segment } from "semantic-ui-react";

interface GraphDisplayProp<NodeDatum, EdgeDatum> {
  width: number,
  height: number,
  graph: Graph<NodeDatum, EdgeDatum>,
  generalRenderHint: GeneralRenderHint,
  nodeRenderHint: NodeRenderHint<NodeDatum>,
  edgeRenderHint: EdgeRenderHint<EdgeDatum>
}

interface GeneralRenderHint {
  directed: boolean,
  nodeRadius: number,
  textColor: string,
  backgroundColor: string,
  simulationForceManyBodyStrength: number,
}

interface NodeRenderHint<NodeDatum> {
  borderThickness: (node: Node<NodeDatum>) => number,
  borderColor: (node: Node<NodeDatum>) => string,
  fillingColor: (node: Node<NodeDatum>) => string,
  floatingData: (node: Node<NodeDatum>) => string,
  popupData: (node: Node<NodeDatum>) => [string, string][]
}

interface EdgeRenderHint<EdgeDatum> {
  thickness: (edge: Edge<EdgeDatum>) => number,
  color: (edge: Edge<EdgeDatum>) => string,
  floatingData: (edge: Edge<EdgeDatum>) => string,
}

interface D3SimulationNode<NodeDatum> extends SimulationNodeDatum {
  graphNode: Node<NodeDatum>
}

function toD3NodeDatum<NodeDatum>(node: Node<NodeDatum>): D3SimulationNode<NodeDatum> {
  return { index: node.id, graphNode: node };
}

interface D3SimulationEdge<EdgeDatum> extends SimulationLinkDatum<any> {
  graphEdge: Edge<EdgeDatum>
}

function toD3EdgeDatum<EdgeDatum>(edge: Edge<EdgeDatum>): D3SimulationEdge<EdgeDatum> {
  return { source: edge.source, target: edge.target, graphEdge: edge };
}

let GraphDisplay: React.FC<GraphDisplayProp<any, any>> = props => {
  let { width, height, graph, generalRenderHint, nodeRenderHint, edgeRenderHint } = props;

  const makeInRange = (x: number, a: number, b: number) => {
    if (x < a) return a;
    if (x > b) return b;
    return x;
  };

  let onCanvasMount = (canvas: HTMLCanvasElement | null) => {
    let ctx = canvas?.getContext("2d");
    if (ctx == null)
      return;

    const edges = graph.getEdgeList().map(toD3EdgeDatum);
    const nodes = graph.getNodeList().map(toD3NodeDatum);

    let {
      textColor,
      nodeRadius,
      backgroundColor,
      simulationForceManyBodyStrength: manyBodyStrength
    } = generalRenderHint;

    const xInRange = (x: number) => makeInRange(x, nodeRadius, width - nodeRadius);
    const yInRange = (y: number) => makeInRange(y, nodeRadius, height - nodeRadius);

    const boxConstraint: Force<any, any> = () => {
      nodes.forEach(node => {
        node.x = xInRange(node.x);
        node.y = yInRange(node.y);
      });
    };

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges)) // default id implement may work
      .force("charge", d3.forceManyBody().strength(manyBodyStrength))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("box", boxConstraint);

    let tick = () => {
      if (ctx == null)
        return;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "20px monospace";

      edges.forEach(edge => {
        let {
          source: { x: sx, y: sy },
          target: { x: tx, y: ty },
          graphEdge
        } = edge;
        let { directed } = generalRenderHint;
        let { color, thickness, floatingData } = edgeRenderHint;

        ctx.beginPath();
        ctx.fillStyle = ctx.strokeStyle = color(graphEdge);
        ctx.lineWidth = thickness(graphEdge);
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.stroke();

        if (directed) {
          const dx = tx - sx, dy = ty - sy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const sin = dy / distance, cos = dx / distance;
          const a = 10; // TODO: Configurable arrow size
          const px0 = tx - nodeRadius * cos, py0 = ty - nodeRadius * sin;
          const px1 = px0 - a * cos + a * sin, px2 = px0 - a * cos - a * sin;
          const py1 = py0 - a * sin - a * cos, py2 = py0 - a * sin + a * cos;

          ctx.beginPath();
          ctx.moveTo(px0, py0);
          ctx.lineTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.fill();
        }
      });

      nodes.forEach(node => {
        let { borderThickness, borderColor, fillingColor, floatingData, popupData } = nodeRenderHint;
        let { x, y, graphNode } = node;

        ctx.beginPath();

        ctx.strokeStyle = borderColor(graphNode);
        ctx.lineWidth = borderThickness(graphNode);
        ctx.moveTo(x + nodeRadius, y);
        ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = fillingColor(graphNode);
        ctx.fill();

        ctx.fillStyle = textColor;
        ctx.lineWidth = 1;
        ctx.fillText(floatingData(graphNode), x, y);

        // TODO: Render popup data
      });
    };

    simulation.on("tick", tick);

    let drag = d3.drag<HTMLCanvasElement, SimulationNodeDatum | undefined>()
      .subject(event => simulation.find(event.x, event.y))
      .on("start", event => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", event => {
        event.subject.fx = xInRange(event.x);
        event.subject.fy = yInRange(event.y);
      })
      .on("end", event => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    d3.select<HTMLCanvasElement, any>(canvas).call(drag);
  };

  return (
    <>
      <Header as="h4" block attached="top" icon="search" content="editor" />
      <Segment attached="bottom">
        <canvas width={width} height={height} ref={onCanvasMount} />
      </Segment>
    </>
  );
};

export default GraphDisplay;
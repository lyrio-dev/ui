import React from "react";
import * as d3 from "d3";
import * as GS from "../GraphStructure";
import { Graph, GraphBuilder, GraphOption } from "../GraphStructure";
import { SimulationLinkDatum, SimulationNodeDatum } from "d3-force";
import { Header, Segment } from "semantic-ui-react";

interface GraphDisplayProp {
  width: number,
  height: number,
  graph: Graph<any, any>
}

function toD3NodeDatum(node: GS.Node<any>): SimulationNodeDatum {
  return { index: node.id };
}

function toD3EdgeDatum(edge: GS.Edge<any>): SimulationLinkDatum<any> {
  return { source: edge.source, target: edge.target };
}

interface DeterminedNode extends SimulationNodeDatum {
  x: number;
  y: number;
}


class GraphDisplay extends React.Component<GraphDisplayProp> {
  private canvas: HTMLCanvasElement | null = null;
  private canvas_context: CanvasRenderingContext2D | null = null;

  componentDidMount() {
    if (this.canvas === null)
      return;
    this.canvas_context = this.canvas.getContext("2d");
    if (this.canvas_context === null)
      return;

    let g = this.props.graph;

    const edges = g.getEdgeList();
    const nodes = g.getNodeList();
    const d3_links = [...edges].map(toD3EdgeDatum);
    const d3_nodes = [...nodes].map(toD3NodeDatum);
    const width = this.props.width;
    const height = this.props.height;

    const simulation = d3.forceSimulation(d3_nodes)
      .force("link", d3.forceLink(d3_links)) // default id implement may work
      .force("charge", d3.forceManyBody().strength(() => -1000))
      .force("center", d3.forceCenter(width / 2, height / 2));
    const color_scale = d3.scaleOrdinal(d3.schemeCategory10);

    let tick = () => {
      if (this.canvas_context === null) return;
      let ctx = this.canvas_context;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      d3_links.forEach(l => {
        let s = l.source as DeterminedNode, t = l.target as DeterminedNode;
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(t.x, t.y);
      });
      ctx.strokeStyle = "#aaa";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "15px Arial";
      d3_nodes.forEach(n => {
        ctx.beginPath();
        let d = n as DeterminedNode;

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.moveTo(d.x + 20, d.y);
        ctx.arc(d.x, d.y, 20, 0, 2 * Math.PI);

        ctx.fillStyle = color_scale(String(d.index || 0));
        ctx.fill();

        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.strokeText(String(d.index || 0), d.x, d.y);

        ctx.stroke();
      });
    };

    simulation.on("tick", tick);

    let drag = d3.drag<HTMLCanvasElement, SimulationNodeDatum | undefined>()
      .subject(event => simulation.find(event.x, event.y, 30))
      .on("start", event => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", event => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", event => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    d3.select<HTMLCanvasElement, any>(this.canvas).call(drag);
  }

  render() {
    return (
      <>
        <Header as="h4" block attached="top" icon="search" content="editor" />
        <Segment attached="bottom">
          <canvas width={this.props.width} height={this.props.height} ref={c => this.canvas = c} />
        </Segment>
      </>
    );
  }
}

export default GraphDisplay;
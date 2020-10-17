import React from "react";
import ReactDOMServer from "react-dom/server.browser";

export default function svgToDataUrl(SvgComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>) {
  const div = document.createElement("div");
  div.innerHTML = ReactDOMServer.renderToString(<SvgComponent />);

  const svgString = new XMLSerializer().serializeToString(div.firstElementChild);
  return URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
}

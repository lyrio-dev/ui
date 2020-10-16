import React from "react";
import ReactDOM from "react-dom";

export default function svgToDataUrl(SvgComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>) {
  const div = document.createElement("div");
  ReactDOM.render(<SvgComponent />, div);

  const svgString = new XMLSerializer().serializeToString(div.firstElementChild);
  return URL.createObjectURL(new Blob([svgString], { type: "image/svg+xml" }));
}

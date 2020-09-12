import { FilterXSS, escapeAttrValue } from "xss";

// Get the default white list
const xssWhiteList = require("xss/lib/default").whiteList;

// Disallow <audio> and <video> tags
delete xssWhiteList.audio;
delete xssWhiteList.video;

// Allow "style" and "class" attributes
Object.keys(xssWhiteList).forEach(tag => {
  xssWhiteList[tag].push("style", "class");
});

// The "data-id" arrtibute is used for highlight and math rendering
xssWhiteList["span"].push("data-id");

const xss = new FilterXSS({
  whiteList: xssWhiteList,
  stripIgnoreTag: true,
  onTagAttr: (tag, name, value, isWhiteAttr) => {
    // Allow data URIs for <img>
    if (tag.toLowerCase() === "img" && name.toLowerCase() === "src" && value.startsWith("data:image/")) {
      return name + '="' + escapeAttrValue(value) + '"';
    }
  }
});

export function sanitize(html: string) {
  const filteredHtml = xss.process(html);
  if (!filteredHtml) return "";

  // Prevent overflow
  return `<div style="position: relative; overflow: hidden; ">${filteredHtml}</div>`;
}

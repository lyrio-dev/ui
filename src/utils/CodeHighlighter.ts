import Prism from "prismjs";

import cssUrlTomorrow from "@/assets/prism-tomorrow.url.css";
import cssUrlTomorrowNight from "@/assets/prism-tomorrow-night.url.css";

function normalizeCode(code: string) {
  return code.split("\r").join("");
}

function escapeHtml(text: string) {
  text = text.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split(" ").join("&nbsp;");
  return text;
}

export enum CodeHighlighterTheme {
  Tomorrow,
  TomorrowNight
}

const cssLinkTag = document.createElement("link");
cssLinkTag.rel = "stylesheet";
document.head.appendChild(cssLinkTag);

export function setPrismTheme(theme: CodeHighlighterTheme) {
  switch (theme) {
    case CodeHighlighterTheme.Tomorrow:
      cssLinkTag.href = cssUrlTomorrow;
      break;
    case CodeHighlighterTheme.TomorrowNight:
      cssLinkTag.href = cssUrlTomorrowNight;
      break;
  }
}

export function highlight(code: string, language: string) {
  code = normalizeCode(code);

  function doHighlight() {
    if (language) {
      try {
        const name = language.trim().toLowerCase();
        if (name in Prism.languages) {
          return Prism.highlight(code, Prism.languages[name], name);
        }
      } catch (e) {
        console.error(`Failed to highlight, language = ${language}`, e);
      }
    }

    return escapeHtml(code).split("\n").join("<br>");
  }

  // See src/assets/prism-tomorrow.url.css
  return `<div class="highlighted">${doHighlight()}</div>`;
}

const cssUrlTomorrow = new URL("../assets/prism-tomorrow.css", import.meta.url).toString();
const cssUrlTomorrowNight = new URL("../assets/prism-tomorrow-night.css", import.meta.url).toString();

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

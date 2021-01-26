import { CodeHighlighterTheme, setPrismTheme } from "@/utils/CodeHighlighter";

export interface ThemeMeta {
  highlight: CodeHighlighterTheme;
  editor: string;
}

import pure from "./pure";
import far from "./far";

export const defaultLightTheme = "pure";
export const defaultDarkTheme = "far";

export const themeList: Record<string, ThemeMeta> = {
  pure,
  far
};

export function setGlobalTheme(theme: string) {
  document.body.setAttribute("data-theme", theme);
  setPrismTheme(themeList[theme].highlight);
}

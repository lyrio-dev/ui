import "typeface-lato"; // UI
import "typeface-saira"; // Logo

// Content
import "@fontsource/noto-sans";
import "@fontsource/noto-serif";
import "@fontsource/nunito-sans";
import "@fontsource/open-sans";
import "@fontsource/pt-sans";
import "@fontsource/roboto";
import "@fontsource/roboto-slab";
import "@fontsource/source-serif-pro";
import "@fontsource/zilla-slab";

// Code
import "@fontsource/fira-code";
import "@fontsource/roboto-mono";
import "@fontsource/inconsolata";
import "@fontsource/source-code-pro";
import "@fontsource/ubuntu-mono";
import "@fontsource/pt-mono";
import "hack-font/build/web/hack-subset.css";
import "@fontsource/dm-mono";
import "@fontsource/jetbrains-mono";
import "sf-mono-webfont/stylesheet.css";

import type { editor } from "monaco-editor";

import { Locale } from "@/interfaces/Locale";
import { appState } from "@/appState";

// This module uses Vite's compile-time plugin
const uiFontSelectors = import.meta.compileTime("./ui-font-selectors.js") as string[];

export const availableCodeFonts = [
  "Fira Code",
  "Roboto Mono",
  "Inconsolata",
  "Hack",
  "Jetbrains Mono",
  "DM Mono",
  "Source Code Pro",
  "Ubuntu Mono",
  "PT Mono",
  "SF Mono"
];

export const availableContentFonts = [
  "Open Sans",
  "Noto Sans",
  "Noto Serif",
  "Nunito Sans",
  "PT Sans",
  "Lato",
  "Roboto",
  "Roboto Slab",
  "Zilla Slab",
  "Source Serif Pro"
];

function getFallbackFontList(locale: Locale) {
  switch (locale) {
    case Locale.ja_JP:
      return [
        "Noto Sans CJK JP",
        "Source Han Sans JP",
        "ヒラギノ角ゴ Pro",
        "Hiragino Kaku Gothic Pro",
        "メイリオ",
        "Yu Gothic",
        "Meiryo",
        "Osaka",
        "ＭＳ Ｐゴシック",
        "MS PGothic"
      ];
    case Locale.zh_CN:
    case Locale.en_US:
    default:
      return [
        "Noto Sans CJK SC",
        "Source Han Sans SC",
        "PingFang SC",
        "Hiragino Sans GB",
        "Microsoft Yahei",
        "WenQuanYi Micro Hei",
        "Droid Sans Fallback"
      ];
  }
}

function generateFontFamily(preferredFont: string, locale: Locale, fallbackFont?: string) {
  const systemSans = "sans-serif";
  const systemSerif = "serif";
  const systemMono = "monospace";
  const systemFonts = [systemSans, systemSerif, systemMono];

  if (!fallbackFont) {
    const normalizedFontName = preferredFont.toLowerCase();
    if (normalizedFontName.indexOf("sans") !== -1) fallbackFont = systemSans;
    else if (normalizedFontName.indexOf("serif") !== -1 || normalizedFontName.indexOf(" slab") !== -1)
      fallbackFont = systemSerif;
    else fallbackFont = systemSans;
  }

  const fontList = [...getFallbackFontList(locale), fallbackFont];
  if (preferredFont && !systemFonts.includes(preferredFont)) fontList.unshift(preferredFont);

  return fontList.map(font => (systemFonts.includes(font) ? font : JSON.stringify(font))).join(", ");
}

function updateFontCss(id: string, css: string) {
  const style = document.createElement("style");
  style.id = id;
  style.innerHTML = css;

  const oldStyle = document.getElementById(id);
  if (oldStyle) oldStyle.parentNode.replaceChild(style, oldStyle);
  else document.head.appendChild(style);
}

export function updateCodeFontCss(locale: Locale) {
  const fontPreference = appState.userPreference?.font;

  updateFontCss(
    "font-preference-code",
    `.monospace, code, pre {
  font-family: ${generateFontFamily(
    fontPreference?.codeFontFace || availableCodeFonts[0],
    locale,
    "monospace"
  )} !important;
  font-size: ${fontPreference?.codeFontSize || 14}px !important;
  line-height: ${fontPreference?.codeLineHeight || 1.3} !important;
  font-variant-ligatures: ${fontPreference?.codeFontLigatures === false ? "none" : "normal"} !important;
}`
  );
}

export function generateCodeFontEditorOptions(locale: Locale): editor.IStandaloneEditorConstructionOptions {
  const fontPreference = appState.userPreference?.font;
  const fontSize = fontPreference?.codeFontSize || 14;

  return {
    fontFamily: generateFontFamily(fontPreference?.codeFontFace || availableCodeFonts[0], locale, "monospace"),
    fontSize: fontSize,
    lineHeight: (fontPreference?.codeLineHeight || 1.3) * fontSize,
    fontLigatures: fontPreference?.codeFontLigatures !== false
  };
}

export function updateContentFontCss(locale: Locale) {
  const fontPreference = appState.userPreference?.font;

  updateFontCss(
    "font-preference-content",
    `.content-font {
  font-family: ${generateFontFamily(fontPreference?.contentFontFace || availableContentFonts[0], locale)} !important;
}`
  );
}

export function updateUiFontCss(locale: Locale) {
  updateFontCss(
    "font-ui",
    `.ui-font, ${uiFontSelectors.join(", ")} {
  font-family: ${generateFontFamily("Lato", locale, "sans-serif")};
}`
  );
}

export function getMarkdownEditorFontClass() {
  return appState.userPreference?.font?.markdownEditorFont === "code" ? "monospace" : "content-font";
}

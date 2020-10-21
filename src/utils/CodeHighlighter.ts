import * as MonacoTreeSitter from "monaco-tree-sitter";
import Prism from "prismjs";
import TreeSitterWasmUrl from "web-tree-sitter/tree-sitter.wasm";

import { CodeLanguage } from "@/interfaces/CodeLanguage";

// https://github.com/tree-sitter/tree-sitter/issues/559
function patchFetch() {
  const realFetch = window.fetch;
  window.fetch = function () {
    if (typeof arguments[0] === "string" && arguments[0].endsWith("tree-sitter.wasm")) arguments[0] = TreeSitterWasmUrl;
    return realFetch.apply(window, arguments);
  };
}

patchFetch();

// Avoid crashing under browsers without WebAssembly
let Parser: typeof import("web-tree-sitter");
try {
  Parser = require("web-tree-sitter");
} catch (e) {
  console.error(`Failed to load web-tree-sitter:`, e);
}

function normalizeCode(code: string) {
  return code.split("\r").join("");
}

export enum CodeHighlighterTheme {
  Tomorrow
}

// TODO: custom theme support
setTheme(CodeHighlighterTheme.Tomorrow);

/**
 * The highlighting includes three parts:
 *
 * 1. Monaco Editor's basic syntax highlight.
 * 2. Our own highlighter based on Tree Sitter.
 * 3. Prism.js, which will be used for a display only highlighting when tree-sitter
 *    based highlighter is not available.
 *
 * (1) (2) are used for editor. (2) (3) are used for display only code highlighting.
 *
 * (1)'s loading can hardly be customized, so just let it go.
 * (2) could be lazy-loaded asynchronously.
 * (3)'s size is small, no need to lazy-load.
 *
 * The theme of highlighting contains all these three parts.
 * MonacoTreeSitter.Theme controls (1) and (2). (3) should be loaded separately.
 */

// tree-sitter
const loadedTreeSitterLanguages: Map<
  CodeLanguage,
  Promise<MonacoTreeSitter.Language> | MonacoTreeSitter.Language
> = new Map();

function importGrammarJson(language: CodeLanguage): Promise<any> {
  switch (language) {
    case CodeLanguage.CPP:
      return import("monaco-tree-sitter/grammars/cpp.json");
  }
}

function importTreeSitterLanguageLib(language: CodeLanguage): string {
  switch (language) {
    case CodeLanguage.CPP:
      return require("tree-sitter-wasm-prebuilt/lib/tree-sitter-cpp.wasm").default;
  }
}

export async function tryLoadTreeSitterLanguage(language: CodeLanguage): Promise<MonacoTreeSitter.Language> {
  const promiseOrResult = loadedTreeSitterLanguages.get(language);
  if (promiseOrResult) return await promiseOrResult;

  // Check if supported
  const promiseGrammarJson = importGrammarJson(language);
  if (!promiseGrammarJson) return null;

  const promise = (async () => {
    try {
      // Load grammar json and language lib in parallel
      const [grammarJson, languageLib] = await Promise.all([
        promiseGrammarJson,
        Parser.init().then(() => Parser.Language.load(importTreeSitterLanguageLib(language)))
      ]);

      const parser = new Parser();
      parser.setLanguage(languageLib);

      const lang = new MonacoTreeSitter.Language(grammarJson, parser);
      loadedTreeSitterLanguages.set(language, lang);
      return lang;
    } catch (e) {
      console.error(`Failed to load tree-sitter language ${language}`, e);
    }
  })();

  loadedTreeSitterLanguages.set(language, promise);
  return await promise;
}

function importMonacoTreeSitterTheme(theme: CodeHighlighterTheme): Promise<MonacoTreeSitter.ThemeConfig> {
  switch (theme) {
    case CodeHighlighterTheme.Tomorrow:
      return import("@/assets/highlight-themes/tomorrow/monaco-tree-sitter.json") as Promise<
        MonacoTreeSitter.ThemeConfig
      >;
  }
}

function setPrismTheme(theme: CodeHighlighterTheme) {
  switch (theme) {
    case CodeHighlighterTheme.Tomorrow:
      return import("@/assets/highlight-themes/tomorrow/prism.css" as any);
  }
}

export function setTheme(theme: CodeHighlighterTheme) {
  return Promise.all([
    (async () => {
      const themeFile = await importMonacoTreeSitterTheme(theme);
      MonacoTreeSitter.Theme.load(themeFile);
    })(),
    setPrismTheme(theme)
  ]);
}

export function highlight(code: string, language: string, alwaysFallback?: boolean) {
  code = normalizeCode(code);

  if (language) {
    try {
      if (!alwaysFallback) {
        // Check if the language is supported by tree-sitter and loaded.
        const lang = loadedTreeSitterLanguages.get(language as any);
        if (lang instanceof MonacoTreeSitter.Language) {
          return MonacoTreeSitter.highlight(code, lang);
        }
      }

      // Fallback to Prism.js
      const name = language.trim().toLowerCase();
      if (name in Prism.languages) {
        return Prism.highlight(code, Prism.languages[name], name);
      }
    } catch (e) {
      console.error(`Failed to highlight, language = ${language}`, e);
    }
  }

  function escapeHtml(text: string) {
    text = text.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split(" ").join("&nbsp;");
    return text;
  }

  return escapeHtml(code).split("\n").join("<br>");
}

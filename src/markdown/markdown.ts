import MarkdownIt from "markdown-it";
import { v4 as uuid } from "uuid";

import MarkdownItMath from "markdown-it-math-loose";
import MarkdownItMergeCells from "markdown-it-merge-cells/src";
import MarkdownItMentions from "markdown-it-mentions";
import MarkdownItTaskLists from "@hackmd/markdown-it-task-lists";

export interface MarkdownHighlightPlaceholder {
  id: string;
  code: string;
  language: string;
}

export interface MarkdownMathPlaceholder {
  id: string;
  code: string;
  display: boolean;
}

// [result, highlightPlaceholders, mathPlaceholders, findPlaceholderElement]
export function renderMarkdown(
  text: string,
  onPatchRenderer?: (renderer: MarkdownIt) => void
): [
  string,
  MarkdownHighlightPlaceholder[],
  MarkdownMathPlaceholder[],
  (wrapperElement: HTMLElement, id: string) => HTMLSpanElement
] {
  // Use a <span> placeholder for highlights and maths
  // They're replaced after HTML sanitation

  const highlightPlaceholders: MarkdownHighlightPlaceholder[] = [];
  const mathPlaceholders: MarkdownMathPlaceholder[] = [];

  function generatePlaceholder(id: string) {
    return `<span data-id=${id}></span>`;
  }

  function findPlaceholderElement(wrapperElement: HTMLElement, id: string): HTMLSpanElement {
    return wrapperElement.querySelector(`[data-id="${id}"]`);
  }

  function addHighlightPlaceholder(code: string, language: string) {
    const placeholder: MarkdownHighlightPlaceholder = {
      id: uuid(),
      code,
      language
    };

    highlightPlaceholders.push(placeholder);

    return generatePlaceholder(placeholder.id);
  }

  function addMathPlaceholder(code: string, display: boolean) {
    const placeholder: MarkdownMathPlaceholder = {
      id: uuid(),
      code,
      display
    };

    mathPlaceholders.push(placeholder);

    return generatePlaceholder(placeholder.id);
  }

  // Initialize renderer
  const renderer = new MarkdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: false,
    highlight: addHighlightPlaceholder
  });

  renderer.use(MarkdownItMath, {
    inlineOpen: "$",
    inlineClose: "$",
    blockOpen: "$$",
    blockClose: "$$",
    inlineRenderer: (code: string) => addMathPlaceholder(code, false),
    blockRenderer: (code: string) => addMathPlaceholder(code, true)
  });
  renderer.use(MarkdownItMergeCells);
  renderer.use(MarkdownItMentions, {
    parseURL: (username: string) => `/u/${username}`
  });
  renderer.use(MarkdownItTaskLists, {
    enabled: true
  });

  if (onPatchRenderer) onPatchRenderer(renderer);

  return [renderer.render(text), highlightPlaceholders, mathPlaceholders, findPlaceholderElement];
}

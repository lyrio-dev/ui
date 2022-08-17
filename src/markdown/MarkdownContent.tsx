import React, { useEffect, useState } from "react";
import { Placeholder } from "semantic-ui-react";
import type MarkdownIt from "markdown-it";
import twemoji from "twemoji";

import style from "./MarkdownContent.module.less";

import { sanitize } from "./sanitize";
import { useNavigationChecked, useMaybeAsyncFunctionResult } from "@/utils/hooks";
import { getTwemojiOptions } from "@/components/EmojiRenderer";
import { codeBoxStyle } from "@/components/CodeBox";

export interface MarkdownContentPatcher {
  onPatchRenderer?: (renderer: MarkdownIt) => void;
  onPatchResult?: (element: HTMLDivElement) => (() => void) | void;
  onXssFileterAttr?: (
    tagName: string,
    attrName: string,
    value: string,
    escapeAttrValue: (value: string) => string
  ) => string | boolean | void;
}

export interface MarkdownContentProps {
  className?: string;
  content: string;
  noSanitize?: boolean;
  patcher?: MarkdownContentPatcher;
  dontUseContentFont?: boolean;
  noOverflowCutFix?: boolean;
  placeholderLines?: number;
}

// Patch rendered-markdown's styles for semantic-ui
function patchStyles(wrapper: HTMLDivElement) {
  // Wrap <pre> tags with segments
  Array.from(wrapper.getElementsByTagName("pre")).forEach(element => {
    // Wrap
    const segment = document.createElement("div");
    segment.className = "ui existing segment " + codeBoxStyle.segment;
    element.parentNode.replaceChild(segment, element);
    segment.appendChild(element);

    // Add default styles for <pre>
    element.classList.add(codeBoxStyle.pre);
  });

  // Add default class names for <table>
  Array.from(wrapper.getElementsByTagName("table")).forEach(element => {
    if (!element.classList.contains("ui")) {
      element.classList.add("ui", "structured", "celled", "table");
    }
  });
}

function parseUrlIfSameOrigin(href: string) {
  // `new URL` may throw an exception
  try {
    const url = new URL(href, document.location.href);
    // Check internal links
    if (url.origin === document.location.origin) {
      return url;
    }
  } catch (e) {}
  return null;
}

// Cache "await import()" results so we don't need to enter asynchronous flow when need them the next time
let moduleMarkdown: typeof import("./markdown");
let moduleCodeHighlighter: typeof import("@/utils/CodeHighlighter");
let moduleMathJax: typeof import("./mathjax");

async function render(
  content: string,
  noSanitize: boolean,
  patcher: MarkdownContentPatcher,
  callback: (result: string) => void
) {
  const { renderMarkdown } = moduleMarkdown || (moduleMarkdown = await import("./markdown"));

  const [markdownResult, highlightPlaceholders, mathPlaceholders, findPlaceholderElement] = renderMarkdown(
    content,
    patcher?.onPatchRenderer
  );

  const wrapper = document.createElement("div");
  wrapper.innerHTML = noSanitize ? markdownResult : sanitize(markdownResult, patcher?.onXssFileterAttr);

  // Render highlights
  if (highlightPlaceholders.length > 0) {
    const { loadPrism, loadLanguages, highlightSync } =
      moduleCodeHighlighter || (moduleCodeHighlighter = await import("@/utils/CodeHighlighter"));
    const loadPrismPromise = loadPrism();
    if (loadPrismPromise) await loadPrismPromise;
    const loadLanguagesPromise = loadLanguages(highlightPlaceholders.map(item => item.language));
    if (loadLanguagesPromise) await loadLanguagesPromise;

    highlightPlaceholders.forEach(item => {
      const element = findPlaceholderElement(wrapper, item.id);
      element.outerHTML = highlightSync(item.code, item.language);
    });
  }

  // Render maths
  if (mathPlaceholders.length > 0) {
    const { loadMathJax, renderMath } = moduleMathJax || (moduleMathJax = await import("./mathjax"));
    const loadMathJaxPromise = loadMathJax();
    if (loadMathJaxPromise) await loadMathJaxPromise;

    mathPlaceholders.forEach(item => {
      const element = findPlaceholderElement(wrapper, item.id);
      element.parentNode.replaceChild(renderMath(item.code, item.display), element);
    });
  }

  // Render emojis
  twemoji.parse(wrapper, getTwemojiOptions(true));

  // Patch <a> tags for security reason
  Array.from(wrapper.getElementsByTagName("a")).forEach(a => {
    a.relList.add("noreferrer", "noreferrer");
    if (!parseUrlIfSameOrigin(a.href)) a.target = "_blank";
  });

  Array.from(wrapper.getElementsByClassName("task-list-item")).forEach(li => {
    if (li.tagName !== "LI") return;

    const input = li.firstElementChild as HTMLInputElement;
    if (
      !input ||
      input.tagName !== "INPUT" ||
      input.type.toLowerCase() !== "checkbox" ||
      input.className !== "task-list-item-checkbox"
    )
      return;

    const checked = input.checked;

    const semanticCheckbox = document.createElement("div");
    semanticCheckbox.className = "ui checkbox " + style.taskListCheckbox + (checked ? " checked" : "");
    input.className = "hidden";
    semanticCheckbox.appendChild(input);

    const div = document.createElement("div");
    if (div.append) div.append(...li.childNodes);
    else while (li.firstChild) div.appendChild(li.firstChild);
    semanticCheckbox.appendChild(document.createElement("label"));
    semanticCheckbox.appendChild(div);

    li.appendChild(semanticCheckbox);
  });

  patchStyles(wrapper);

  callback(wrapper.innerHTML);
}

// Move all async-rendering-control related code to a helper hook

const MarkdownContent: React.FC<MarkdownContentProps> = props => {
  const [html, pending] = useMaybeAsyncFunctionResult(
    render,
    [props.content, props.noSanitize, props.patcher],
    [props.content]
  );

  const navigation = useNavigationChecked();
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement>();
  useEffect(() => {
    if (!wrapperElement) return;

    const cleanCallbacks: ((() => void) | void)[] = [];

    // Fix internal links with dynamic generated `<a>` will NOT trigger react-navi's navigation
    async function onLinkClick(e: MouseEvent) {
      const targetElement = e.target as HTMLElement;
      if (targetElement.tagName === "A") {
        const a = targetElement as HTMLAnchorElement;
        if (!["", "_self"].includes(a.target.toLowerCase())) return;

        const url = parseUrlIfSameOrigin(a.href);
        if (url) {
          e.preventDefault();
          navigation.navigate(url.pathname + url.search + url.hash);
        }
      }
    }

    wrapperElement.addEventListener("click", onLinkClick);
    cleanCallbacks.push(() => wrapperElement.removeEventListener("click", onLinkClick));

    // Call patcher
    const onPatchResult = props.patcher?.onPatchResult;
    if (onPatchResult && wrapperElement) cleanCallbacks.push(onPatchResult(wrapperElement));

    return () => cleanCallbacks.forEach(fn => fn && fn());
  }, [props.patcher, wrapperElement]);

  return pending ? (
    <Placeholder>
      {[...Array(props.placeholderLines || 4).keys()].map(i => (
        <Placeholder.Line key={i} />
      ))}
    </Placeholder>
  ) : (
    <div
      className={
        style.markdownContent +
        (props.className ? " " + props.className : "") +
        (!props.dontUseContentFont ? " content-font" : "") +
        (props.noOverflowCutFix ? " " + style.noOverflowCutFix : "")
      }
      dangerouslySetInnerHTML={{ __html: html }}
      ref={setWrapperElement}
    />
  );
};

export default React.memo(MarkdownContent);

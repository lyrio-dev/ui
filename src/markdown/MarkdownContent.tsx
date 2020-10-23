import React, { useEffect, useMemo, useState } from "react";
import MarkdownIt from "markdown-it";
import { useNavigation } from "react-navi";
import twemoji from "twemoji";

import style from "./MarkdownContent.module.less";

import { renderMarkdown } from "./markdown";
import { renderMath } from "./mathjax";
import { sanitize } from "./sanitize";
import { highlight } from "@/utils/CodeHighlighter";
import { getTwemojiOptions } from "@/components/EmojiRenderer";

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

interface MarkdownContentProps {
  className?: string;
  content: string;
  noSanitize?: boolean;
  patcher?: MarkdownContentPatcher;
}

// Patch rendered-markdown's styles for semantic-ui
function patchStyles(wrapper: HTMLDivElement) {
  // Wrap <pre> tags with segments
  Array.from(wrapper.getElementsByTagName("pre")).forEach(element => {
    // Wrap
    const segment = document.createElement("div");
    segment.className = "ui existing segment";
    element.parentNode.replaceChild(segment, element);
    segment.appendChild(element);

    // Add default styles for <pre>
    element.classList.add(style.pre);
  });

  // Add default class names for <table>
  Array.from(wrapper.getElementsByTagName("table")).forEach(element => {
    if (!element.classList.contains("ui")) {
      element.classList.add("ui", "structured", "celled", "table");
    }
  });

  // Replace <blockquote> tags with messages
  Array.from(wrapper.getElementsByTagName("blockquote")).forEach(element => {
    const message = document.createElement("div");
    message.className = "ui message";
    message.append(...element.childNodes);
    element.parentNode.replaceChild(message, element);
  });

  // Align the only <img> tag in paragraph
  Array.from(wrapper.querySelectorAll<HTMLImageElement>("p > img:only-child")).forEach(element => {
    element.style.display = "block";
    element.style.margin = "0 auto";
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

const MarkdownContent: React.FC<MarkdownContentProps> = props => {
  const html = useMemo(() => {
    const [markdownResult, highlightPlaceholders, mathPlaceholders, findPlaceholderElement] = renderMarkdown(
      props.content,
      props.patcher?.onPatchRenderer
    );

    const wrapper = document.createElement("div");
    wrapper.innerHTML = props.noSanitize ? markdownResult : sanitize(markdownResult, props.patcher?.onXssFileterAttr);

    // Render highlights
    highlightPlaceholders.forEach(item => {
      const element = findPlaceholderElement(wrapper, item.id);
      element.outerHTML = highlight(item.code, item.language);
    });

    // Render maths
    mathPlaceholders.forEach(item => {
      const element = findPlaceholderElement(wrapper, item.id);
      element.parentNode.replaceChild(renderMath(item.code, item.display), element);
    });

    // Render emojis
    twemoji.parse(wrapper, getTwemojiOptions(true));

    // Patch <a> tags for security reason
    Array.from(wrapper.getElementsByTagName("a")).forEach(a => {
      a.relList.add("noreferrer", "noreferrer");
      if (!parseUrlIfSameOrigin(a.href)) a.target = "_blank";
    });

    patchStyles(wrapper);

    return wrapper.innerHTML;
  }, [props.content, props.noSanitize, props.patcher]);

  const navigation = useNavigation();
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

  return (
    <div
      className={style.markdownContent + (props.className ? " " + props.className : "")}
      dangerouslySetInnerHTML={{ __html: html }}
      ref={setWrapperElement}
    />
  );
};

export default React.memo(MarkdownContent);

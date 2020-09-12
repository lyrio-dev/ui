import React, { useMemo } from "react";

import { renderMarkdown } from "./markdown";
import { renderMath } from "./mathjax";
import { sanitize } from "./sanitize";
import { highlight } from "@/utils/CodeHighlighter";

import style from "./MarkdownContent.module.less";

interface MarkdownContentProps {
  content: string;
  noSanitize?: boolean;
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

const MarkdownContent: React.FC<MarkdownContentProps> = props => {
  const html = useMemo(() => {
    const [markdownResult, highlightPlaceholders, mathPlaceholders, findPlaceholderElement] = renderMarkdown(
      props.content
    );

    const wrapper = document.createElement("div");
    wrapper.innerHTML = props.noSanitize ? markdownResult : sanitize(markdownResult);

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

    patchStyles(wrapper);

    return wrapper.innerHTML;
  }, [props.content, props.noSanitize]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default React.memo(MarkdownContent);

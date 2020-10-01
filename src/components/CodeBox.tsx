import React, { useEffect, useMemo, useState } from "react";
import { Segment, SegmentProps } from "semantic-ui-react";
import AnsiToHtmlConverter from "ansi-to-html";

import style from "./CodeBox.module.less";
import * as CodeHighlighter from "@/utils/CodeHighlighter";

interface CodeBoxProps {
  children?: React.ReactNode;
  className?: string;
  segmentClassName?: string;
  segment?: SegmentProps;
  title?: React.ReactNode;
  content?: React.ReactNode;
  html?: string;
  fontFaceOverride?: string;
  fontSizeOverride?: number;
  lineHeightOverride?: number;
  fontLigaturesOverride?: boolean;
}

export const CodeBox = React.forwardRef<HTMLPreElement, CodeBoxProps>((props, ref) => {
  const content = !props.html ? props.content : undefined;
  const [preElement, setPreElement] = useState<HTMLPreElement>();

  function refPre(pre: HTMLPreElement) {
    if (typeof ref === "function") ref(pre);
    else if (ref) ref.current = pre;

    setPreElement(pre);
  }

  useEffect(() => {
    // Override font
    if (preElement) {
      if (props.fontFaceOverride)
        preElement.style.setProperty("font-family", `"${props.fontFaceOverride}"`, "important");
      else preElement.style.removeProperty("font-family");

      if (typeof props.fontSizeOverride === "number")
        preElement.style.setProperty("font-size", `${props.fontSizeOverride}px`, "important");
      else preElement.style.removeProperty("font-size");

      if (typeof props.lineHeightOverride === "number")
        preElement.style.setProperty("line-height", String(props.lineHeightOverride), "important");
      else preElement.style.removeProperty("line-height");

      // fontLigatures is enabled by default
      if (props.fontLigaturesOverride === false)
        preElement.style.setProperty("font-variant-ligatures", "none", "important");
      else preElement.style.removeProperty("font-variant-ligatures");
    }
  }, [
    preElement,
    props.fontFaceOverride,
    props.fontSizeOverride,
    props.lineHeightOverride,
    props.fontLigaturesOverride
  ]);

  return (
    (props.html || content) && (
      <div className={style.codeBox + (props.className ? " " + props.className : "")}>
        {props.title && <p>{typeof props.title === "string" ? <strong>{props.title}</strong> : props.title}</p>}
        <Segment
          className={style.codeBoxSegment + (props.segmentClassName ? " " + props.segmentClassName : "")}
          {...props.segment}
        >
          {props.children}
          <pre
            ref={refPre}
            className={style.codeBoxContent}
            dangerouslySetInnerHTML={props.html && { __html: props.html }}
          >
            {content}
          </pre>
        </Segment>
      </div>
    )
  );
});

interface HighlightedCodeBoxProps {
  children?: React.ReactNode;
  className?: string;
  segmentClassName?: string;
  segment?: SegmentProps;
  title?: React.ReactNode;
  code: string;
  language: string;
  fontFaceOverride?: string;
  fontSizeOverride?: number;
  lineHeightOverride?: number;
  fontLigaturesOverride?: boolean;
}

export const HighlightedCodeBox = React.forwardRef<HTMLPreElement, HighlightedCodeBoxProps>((props, ref) => {
  const html = CodeHighlighter.highlight(props.code, props.language);
  return (
    <CodeBox
      className={props.className}
      segmentClassName={props.segmentClassName}
      segment={props.segment}
      title={props.title}
      html={html}
      fontFaceOverride={props.fontFaceOverride}
      fontSizeOverride={props.fontSizeOverride}
      lineHeightOverride={props.lineHeightOverride}
      fontLigaturesOverride={props.fontLigaturesOverride}
      ref={ref}
    >
      {props.children}
    </CodeBox>
  );
});

interface AnsiCodeBoxProps {
  className?: string;
  title?: React.ReactNode;
  ansiMessage: string;
}

export const AnsiCodeBox = React.forwardRef<HTMLPreElement, AnsiCodeBoxProps>((props, ref) => {
  const html = useMemo(() => {
    const converter = new AnsiToHtmlConverter({ escapeXML: true });
    return converter.toHtml(props.ansiMessage);
  }, [props.ansiMessage]);

  return <CodeBox className={style.mainCodeBox} title={props.title} html={html} ref={ref} />;
});

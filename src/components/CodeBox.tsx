import React, { useEffect, useMemo, useState } from "react";
import { Segment, SegmentProps } from "semantic-ui-react";
import AnsiToHtmlConverter from "ansi-to-html";

import style from "./CodeBox.module.less";
import * as CodeHighlighter from "@/utils/CodeHighlighter";
import { useIntlMessage } from "@/utils/hooks";

export type OmittableString =
  | string
  | {
      data: string;
      omittedLength: number;
    };

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

interface OmittedLabelProps {
  omittedLength: number;
}

const OmittedLabel: React.FC<OmittedLabelProps> = props => {
  const _ = useIntlMessage("components.code_box");

  return (
    <div className={style.omittedLabel + " monospace"}>
      {props.omittedLength === 1
        ? _(".omitted", { count: props.omittedLength })
        : _(".omitted_s", { count: props.omittedLength })}
    </div>
  );
};

interface OmittableCodeBoxProps {
  className?: string;
  title?: React.ReactNode;
  content: OmittableString;
}

export const OmittableCodeBox: React.FC<OmittableCodeBoxProps> = React.forwardRef<
  HTMLPreElement,
  OmittableCodeBoxProps
>((props, ref) => {
  const content = typeof props.content === "string" ? props.content : props.content.data;
  const omittedLength = typeof props.content === "string" ? 0 : props.content.omittedLength;
  return (
    <CodeBox className={style.mainCodeBox} title={props.title} content={content} ref={ref}>
      {omittedLength ? <OmittedLabel omittedLength={omittedLength} /> : null}
    </CodeBox>
  );
});

interface OmittableAnsiCodeBoxProps {
  className?: string;
  title?: React.ReactNode;
  ansiMessage: OmittableString;
}

export const OmittableAnsiCodeBox = React.forwardRef<HTMLPreElement, OmittableAnsiCodeBoxProps>((props, ref) => {
  const [html, omittedLength] = useMemo(() => {
    const converter = new AnsiToHtmlConverter({ escapeXML: true });
    const text = typeof props.ansiMessage === "string" ? props.ansiMessage : props.ansiMessage.data;
    const omittedLength = typeof props.ansiMessage === "string" ? 0 : props.ansiMessage.omittedLength;
    return [converter.toHtml(text), omittedLength];
  }, [props.ansiMessage]);

  return (
    <CodeBox className={style.mainCodeBox} title={props.title} html={html} ref={ref}>
      {omittedLength ? <OmittedLabel omittedLength={omittedLength} /> : null}
    </CodeBox>
  );
});

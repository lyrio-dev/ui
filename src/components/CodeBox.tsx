import React, { useMemo } from "react";
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
}

export const CodeBox = React.forwardRef<HTMLPreElement, CodeBoxProps>((props, ref) => {
  const content = !props.html ? props.content : undefined;

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
            ref={ref}
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

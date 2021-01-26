import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import ReactMonacoEditor from "react-monaco-editor";
import * as Monaco from "monaco-editor";
import { registerRulesForLanguage } from "monaco-ace-tokenizer";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

import style from "./CodeEditor.module.less";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { appState } from "@/appState";
import { generateCodeFontEditorOptions } from "@/misc/fonts";
import { themeList } from "@/themes";

const isIE = navigator.userAgent.indexOf("Trident") !== -1;

function loadAceHighlights() {
  Monaco.languages.register({ id: "haskell" });
  registerRulesForLanguage("haskell", new (require("monaco-ace-tokenizer/es/ace/definitions/haskell").default)());
}
if (!isIE) loadAceHighlights();

Monaco.editor.defineTheme("tomorrow", require("@/assets/monaco-tomorrow.json"));
Monaco.editor.defineTheme("tomorrow-night", require("@/assets/monaco-tomorrow-night.json"));

export interface CodeEditorProps {
  editorDidMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  className?: string;
  value: string;
  language: CodeLanguage | string;
  onChange?: (newValue: string) => void;
  options?: Monaco.editor.IEditorConstructionOptions;
}

let CodeEditor: React.FC<CodeEditorProps> = props => {
  const refEditor = useRef<Monaco.editor.IStandaloneCodeEditor>();
  function editorDidMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().setEOL(Monaco.editor.EndOfLineSequence.LF);

    refEditor.current = editor;
    console.log("Monaco Editor:", editor);

    if (props.editorDidMount) props.editorDidMount(editor);
  }

  // The Monaco Editor's automaticLayout option doesn't work on a initially hidden editor
  // So use ResizeSensor instead
  const containerRef = useRef<HTMLDivElement>();
  const resizeSensorRef = useRef<ResizeSensor>();
  function initializeResizeSensor(div: HTMLDivElement) {
    if (containerRef.current !== div) {
      if (resizeSensorRef.current) {
        resizeSensorRef.current.detach();
      }
      if (div) {
        resizeSensorRef.current = new ResizeSensor(div, () => {
          if (refEditor.current) refEditor.current.layout();
        });
      } else resizeSensorRef.current = null;
      containerRef.current = div;
    }
  }

  return (
    <div
      ref={isIE ? undefined : initializeResizeSensor}
      className={props.className ? `${style.editorContainer} ${props.className}` : style.editorContainer}
    >
      {
        // Monaco editor doesn't support IE
        isIE ? (
          props.editorDidMount ? (
            <>Editor not supported on IE</>
          ) : (
            // Fallback to <textarea>
            <textarea
              className={`monospace ${style.fallbackTextArea}`}
              value={props.value}
              onChange={e => props.onChange(e.target.value)}
            />
          )
        ) : (
          <ReactMonacoEditor
            theme={themeList[appState.theme].editor}
            language={props.language}
            value={props.value}
            options={{
              lineNumbersMinChars: 4,
              ...generateCodeFontEditorOptions(appState.locale),
              ...props.options
            }}
            editorDidMount={editorDidMount}
            onChange={props.onChange}
          />
        )
      }
    </div>
  );
};

CodeEditor = observer(CodeEditor);

export default CodeEditor;

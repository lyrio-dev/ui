import React, { useRef } from "react";
import { observer } from "mobx-react";
import ReactMonacoEditor from "react-monaco-editor";
import * as Monaco from "monaco-editor";
import { MonacoTreeSitter, Language } from "monaco-tree-sitter";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

import style from "./CodeEditor.module.less";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { tryLoadTreeSitterLanguage } from "@/utils/CodeHighlighter";

export interface CodeEditorProps {
  editorDidMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
  className?: string;
  value: string;
  language: CodeLanguage | string;
  onChange?: (newValue: string) => void;
  options?: Monaco.editor.IEditorConstructionOptions;
}

let CodeEditor: React.FC<CodeEditorProps> = props => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor>();
  function editorDidMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().setEOL(Monaco.editor.EndOfLineSequence.LF);

    editorRef.current = editor;
    console.log("Monaco Editor:", editor);
    if (!mtsRef.current && languageObjectRef.current) initialize();

    if (props.editorDidMount) props.editorDidMount(editor);
  }

  const languageRef = useRef<CodeLanguage | string>();
  const languageObjectRef = useRef<Language>();
  if (languageRef.current !== props.language) {
    languageRef.current = props.language;
    tryLoadTreeSitterLanguage(languageRef.current as CodeLanguage).then(languageObject => {
      if (!languageObject) {
        // Failed to load, fallback to monaco's basic syntax highlighting
        if (mtsRef.current) mtsRef.current.refresh();
        return;
      }

      languageObjectRef.current = languageObject;
      if (!mtsRef.current && editorRef.current) initialize();
      else if (mtsRef.current) mtsRef.current.changeLanguage(languageObject);
    });
  }

  const mtsRef = useRef<MonacoTreeSitter>();
  function initialize() {
    mtsRef.current = new MonacoTreeSitter(Monaco, editorRef.current, languageObjectRef.current);
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
          if (editorRef.current) editorRef.current.layout();
        });
      } else resizeSensorRef.current = null;
      containerRef.current = div;
    }
  }

  return (
    <div
      ref={initializeResizeSensor}
      className={props.className ? `${style.editorContainer} ${props.className}` : style.editorContainer}
    >
      <ReactMonacoEditor
        language={props.language}
        value={props.value}
        options={Object.assign(
          {
            lineNumbersMinChars: 4,
            fontFamily: '"Fira Code", monospace'
          },
          props.options
        )}
        editorDidMount={editorDidMount}
        onChange={props.onChange}
      />
    </div>
  );
};

CodeEditor = observer(CodeEditor);

export default CodeEditor;

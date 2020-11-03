import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import ReactMonacoEditor from "react-monaco-editor";
import * as Monaco from "monaco-editor";
import { MonacoTreeSitter } from "monaco-tree-sitter";
import { registerRulesForLanguage } from "monaco-ace-tokenizer";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

import style from "./CodeEditor.module.less";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { tryLoadTreeSitterLanguage } from "@/utils/CodeHighlighter";
import { appState } from "@/appState";
import { availableCodeFonts } from "@/misc/webfonts";

function loadAceHighlights() {
  Monaco.languages.register({ id: "haskell" });
  registerRulesForLanguage("haskell", new (require("monaco-ace-tokenizer/es/ace/definitions/haskell").default)());
}
loadAceHighlights();

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
  const refLoadMtsOnEditorLoaded = useRef<() => void>();
  function editorDidMount(editor: Monaco.editor.IStandaloneCodeEditor) {
    editor.getModel().setEOL(Monaco.editor.EndOfLineSequence.LF);

    refEditor.current = editor;
    console.log("Monaco Editor:", editor);
    if (refLoadMtsOnEditorLoaded.current) refLoadMtsOnEditorLoaded.current();

    if (props.editorDidMount) props.editorDidMount(editor);
  }

  const refMts = useRef<MonacoTreeSitter>();
  const refSetLanguageCount = useRef<number>(0);
  useEffect(() => {
    const i = ++refSetLanguageCount.current;
    tryLoadTreeSitterLanguage(props.language as CodeLanguage).then(languageObject => {
      if (i !== refSetLanguageCount.current) return;

      function initialize() {
        refMts.current = new MonacoTreeSitter(Monaco, refEditor.current, languageObject);
      }

      // Language loaded after editor loaded
      if (refEditor.current) {
        if (!refMts.current)
          // MTS is not loaded or has been disposed
          initialize();
        // MTS presents
        else refMts.current.changeLanguage(languageObject);
      }
      // Load it when on editor loaded
      else refLoadMtsOnEditorLoaded.current = initialize;
    });
  }, [props.language]);

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

  const fontSize = appState.userPreference.font?.codeFontSize || 14;

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
            fontFamily: `"${
              appState.userPreference.font?.codeFontFace || availableCodeFonts[0] || "monospace"
            }", monospace`,
            fontSize: fontSize,
            lineHeight: (appState.userPreference.font?.codeLineHeight || 1.3) * fontSize,
            fontLigatures: appState.userPreference.font?.codeFontLigatures !== false
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

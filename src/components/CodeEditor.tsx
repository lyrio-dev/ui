import React, { useEffect, useRef } from "react";
import { observer } from "mobx-react";
import ReactMonacoEditor from "react-monaco-editor";
import { registerRulesForLanguage } from "monaco-ace-tokenizer";
import ResizeSensor from "css-element-queries/src/ResizeSensor";
import path from "path";

import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

if (!import.meta.env.LEGACY) {
  // Vite's legacy build doesn't support WebWorker, since all workers are emitted as ES modules
  self["MonacoEnvironment"] = {
    getWorker() {
      const OriginalWorkerConstructor = window.Worker;
      const InterceptedWorkerConstructor = function () {
        const args = Array.from(arguments);
        if (new URL(args[0], location.href).origin !== location.origin) {
          args[0] = `data:text/javascript,import${JSON.stringify(args[0])}`;
        }

        // @ts-ignore
        return new OriginalWorkerConstructor(...args);
      } as any;

      window.Worker = InterceptedWorkerConstructor;
      const editorWorker = new EditorWorker();
      window.Worker = OriginalWorkerConstructor;

      return editorWorker;
    }
  };
}

import "monaco-editor/esm/vs/basic-languages/yaml/yaml.js";
import "monaco-editor/esm/vs/basic-languages/cpp/cpp.js";
import "monaco-editor/esm/vs/basic-languages/java/java.js";
import "monaco-editor/esm/vs/basic-languages/kotlin/kotlin.js";
import "monaco-editor/esm/vs/basic-languages/pascal/pascal.js";
import "monaco-editor/esm/vs/basic-languages/python/python.js";
import "monaco-editor/esm/vs/basic-languages/rust/rust.js";
import "monaco-editor/esm/vs/basic-languages/go/go.js";
import "monaco-editor/esm/vs/basic-languages/csharp/csharp.js";
import "monaco-editor/esm/vs/basic-languages/fsharp/fsharp.js";

import "monaco-editor/esm/vs/editor/contrib/bracketMatching/browser/bracketMatching.js";
import "monaco-editor/esm/vs/editor/contrib/caretOperations/browser/caretOperations.js";
import "monaco-editor/esm/vs/editor/contrib/clipboard/browser/clipboard.js";
import "monaco-editor/esm/vs/editor/contrib/contextmenu/browser/contextmenu.js";
import "monaco-editor/esm/vs/editor/browser/controller/coreCommands.js";
import "monaco-editor/esm/vs/editor/contrib/cursorUndo/browser/cursorUndo.js";
import "monaco-editor/esm/vs/editor/contrib/find/browser/findController.js";
import "monaco-editor/esm/vs/editor/contrib/folding/browser/folding.js";
import "monaco-editor/esm/vs/editor/contrib/fontZoom/browser/fontZoom.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickAccess/standaloneGotoLineQuickAccess.js";
import "monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js";
import "monaco-editor/esm/vs/editor/contrib/inPlaceReplace/browser/inPlaceReplace.js";
import "monaco-editor/esm/vs/editor/contrib/indentation/browser/indentation.js";
import "monaco-editor/esm/vs/editor/contrib/linesOperations/browser/linesOperations.js";
import "monaco-editor/esm/vs/editor/contrib/links/browser/links.js";
import "monaco-editor/esm/vs/editor/contrib/multicursor/browser/multicursor.js";
import "monaco-editor/esm/vs/editor/contrib/smartSelect/browser/smartSelect.js";
import "monaco-editor/esm/vs/editor/contrib/unusualLineTerminators/browser/unusualLineTerminators.js";

import * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

import style from "./CodeEditor.module.less";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { appState } from "@/appState";
import { generateCodeFontEditorOptions } from "@/misc/fonts";
import { themeList } from "@/themes";

// ACE highlights
import AceHighlightHaskell from "monaco-ace-tokenizer/es/ace/definitions/haskell";
Monaco.languages.register({ id: "haskell" });
registerRulesForLanguage("haskell", new AceHighlightHaskell());

// Monaco themes

Object.entries(import.meta.globEager("../assets/monaco-themes/*.json")).forEach(([filename, data]) => {
  Monaco.editor.defineTheme(path.basename(filename, ".json"), data as any);
});

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
      ref={initializeResizeSensor}
      className={props.className ? `${style.editorContainer} ${props.className}` : style.editorContainer}
    >
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
    </div>
  );
};

CodeEditor = observer(CodeEditor);

export default CodeEditor;

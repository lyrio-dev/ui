import React, { lazy, Suspense } from "react";
import { Loader } from "semantic-ui-react";
import { loader as monacoLoader } from "@monaco-editor/react";
import type { CodeEditorProps } from "./CodeEditor";

import style from "./CodeEditor.module.less";

const CodeEditor = lazy(async () => {
  monacoLoader.config({
    paths: {
      vs: `${window.cdnjs}/monaco-editor/${EXTERNAL_PACKAGE_VERSION["monaco-editor"]}/min/vs`
    }
  });
  window["Monaco"] = await monacoLoader.init();
  return import("./CodeEditor");
});

const LazyCodeEditor: React.FC<CodeEditorProps> = props => {
  const loading = (
    <div className={props.className ? `${style.editorContainer} ${props.className}` : style.editorContainer}>
      <Loader className="workaround" active />
    </div>
  );
  return (
    <Suspense fallback={loading}>
      <CodeEditor {...props} />
    </Suspense>
  );
};

export default LazyCodeEditor;

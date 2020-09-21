import React from "react";
import { Form } from "semantic-ui-react";
import { observer } from "mobx-react";
import objectPath from "object-path";

import { useIntlMessage } from "@/utils/hooks";
import { CodeLanguage, getPreferredCodeLanguage, getPreferredCompileAndRunOptions } from "@/interfaces/CodeLanguage";
import CodeLanguageAndOptionsComponent from "@/components/CodeLanguageAndOptions";

interface CodeLanguageAndOptionsProps {
  objectPath: string;
  pendingSubmit: boolean;
  submissionContent: object;
  onUpdateSubmissionContent: (path: string, value: unknown) => void;
}

let CodeLanguageAndOptions: React.FC<CodeLanguageAndOptionsProps> = props => {
  const _ = useIntlMessage("problem");

  const submissionContent = objectPath.get(props.submissionContent, props.objectPath) as {
    language: CodeLanguage;
    compileAndRunOptions: Record<string, unknown>;
  };

  function onUpdate(path: string, value: unknown) {
    props.onUpdateSubmissionContent(props.objectPath ? props.objectPath + "." + path : path, value);
  }

  return (
    <Form>
      <CodeLanguageAndOptionsComponent
        pending={props.pendingSubmit}
        language={submissionContent.language}
        compileAndRunOptions={submissionContent.compileAndRunOptions}
        onUpdateLanguage={newLanguage => onUpdate("language", newLanguage)}
        onUpdateCompileAndRunOptions={compileAndRunOptions => onUpdate("compileAndRunOptions", compileAndRunOptions)}
      />
    </Form>
  );
};

CodeLanguageAndOptions = observer(CodeLanguageAndOptions);

export default Object.assign(CodeLanguageAndOptions, {
  getDefault: () => ({
    language: getPreferredCodeLanguage(),
    code: "",
    compileAndRunOptions: getPreferredCompileAndRunOptions(getPreferredCodeLanguage())
  })
});

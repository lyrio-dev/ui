import React from "react";
import { Form } from "semantic-ui-react";
import { observer } from "mobx-react";
import objectPath from "object-path";

import { useIntlMessage } from "@/utils/hooks";
import { CodeLanguage, getPreferredCodeLanguage, getPreferredCodeLanguageOptions } from "@/interfaces/CodeLanguage";
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
    languageOptions: Record<string, unknown>;
  };

  function onUpdate(path: string, value: unknown) {
    props.onUpdateSubmissionContent(props.objectPath ? props.objectPath + "." + path : path, value);
  }

  return (
    <Form>
      <CodeLanguageAndOptionsComponent
        pending={props.pendingSubmit}
        language={submissionContent.language}
        languageOptions={submissionContent.languageOptions}
        onUpdateLanguage={newLanguage => onUpdate("language", newLanguage)}
        onUpdateLanguageOptions={languageOptions => onUpdate("languageOptions", languageOptions)}
      />
    </Form>
  );
};

CodeLanguageAndOptions = observer(CodeLanguageAndOptions);

export default Object.assign(CodeLanguageAndOptions, {
  getDefault: () => ({
    language: getPreferredCodeLanguage(),
    code: "",
    languageOptions: getPreferredCodeLanguageOptions(getPreferredCodeLanguage())
  })
});

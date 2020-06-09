import React, { useRef } from "react";
import { Form } from "semantic-ui-react";
import { observer } from "mobx-react";
import objectPath from "object-path";

import { useIntlMessage } from "@/utils/hooks";
import {
  codeLanguageOptions,
  CodeLanguageOptionType,
  CodeLanguage,
  getPreferredCodeLanguage,
  getPreferredCodeLanguageOptions
} from "@/interfaces/CodeLanguage";

interface LanguageAndOptionsProps {
  objectPath: string;
  pendingSubmit: boolean;
  submissionContent: object;
  onUpdateSubmissionContent: (path: string, value: unknown) => void;
}

let LanguageAndOptions: React.FC<LanguageAndOptionsProps> = props => {
  const _ = useIntlMessage();

  const submissionContent = objectPath.get(props.submissionContent as object, props.objectPath) as {
    language: CodeLanguage;
    languageOptions: object;
  };

  function onUpdate(path: string, value: unknown) {
    props.onUpdateSubmissionContent(props.objectPath ? props.objectPath + "." + path : path, value);
  }

  const codeLanguageOptionsBackup = useRef(new Map<CodeLanguage, object>()).current;
  function onSwitchLanguage(newLanguage: CodeLanguage) {
    const oldLanguage = submissionContent.language;
    codeLanguageOptionsBackup.set(oldLanguage, submissionContent.languageOptions);
    onUpdate("language", newLanguage);
    onUpdate(
      "languageOptions",
      codeLanguageOptionsBackup.get(newLanguage) || getPreferredCodeLanguageOptions(newLanguage)
    );
  }

  return (
    <Form>
      <Form.Select
        label={_("problem.submit.language")}
        value={submissionContent.language}
        options={Object.keys(codeLanguageOptions).map(language => ({
          key: language,
          value: language,
          text: _(`code_language.${language}.name`)
        }))}
        onChange={(e, { value }) => onSwitchLanguage(value as CodeLanguage)}
      />
      {codeLanguageOptions[submissionContent.language as CodeLanguage].map(option => {
        switch (option.type) {
          case CodeLanguageOptionType.Select:
            return (
              <Form.Select
                key={option.name}
                label={_(`code_language.${submissionContent.language}.options.${option.name}.name`)}
                value={submissionContent.languageOptions[option.name]}
                options={option.values.map(value => ({
                  key: value,
                  value: value,
                  text: _(`code_language.${submissionContent.language}.options.${option.name}.values.${value}`)
                }))}
                onChange={(e, { value }) => onUpdate(`languageOptions.${option.name}`, value)}
              />
            );
        }
      })}
    </Form>
  );
};

LanguageAndOptions = observer(LanguageAndOptions);

export default Object.assign(LanguageAndOptions, {
  getDefault: () => ({
    language: getPreferredCodeLanguage(),
    code: "",
    languageOptions: getPreferredCodeLanguageOptions(getPreferredCodeLanguage())
  })
});

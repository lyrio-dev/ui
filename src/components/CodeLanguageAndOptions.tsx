import React, { useRef } from "react";
import { Form } from "semantic-ui-react";
import { observer } from "mobx-react";

import { useIntlMessage } from "@/utils/hooks";
import {
  codeLanguageOptions,
  CodeLanguageOptionType,
  CodeLanguage,
  getPreferredCodeLanguageOptions
} from "@/interfaces/CodeLanguage";

interface CodeLanguageAndOptionsProps {
  pending?: boolean;
  elementAfterLanguageSelect?: React.ReactNode;
  headerForLanguage?: string;
  classNameForLanguage?: string;
  classNameForLanguageOptions?: string;
  language: CodeLanguage;
  languageOptions: Record<string, unknown>;
  onUpdateLanguage: (newLanguage: CodeLanguage) => void;
  onUpdateLanguageOptions: (newLanguageOptions: Record<string, unknown>) => void;
}

let CodeLanguageAndOptions: React.FC<CodeLanguageAndOptionsProps> = props => {
  const _ = useIntlMessage("code_language");

  const codeLanguageOptionsBackup = useRef(new Map<CodeLanguage, Record<string, unknown>>()).current;
  function onSwitchLanguage(newLanguage: CodeLanguage) {
    const oldLanguage = props.language;
    codeLanguageOptionsBackup.set(oldLanguage, props.languageOptions);
    props.onUpdateLanguage(newLanguage);
    props.onUpdateLanguageOptions(
      codeLanguageOptionsBackup.get(newLanguage) || getPreferredCodeLanguageOptions(newLanguage)
    );
  }

  return (
    <>
      <Form.Select
        className={props.classNameForLanguage}
        label={props.headerForLanguage || _(".code_language")}
        value={props.language}
        options={Object.keys(codeLanguageOptions).map(language => ({
          key: language,
          value: language,
          text: _(`.${language}.name`)
        }))}
        onChange={(e, { value }) => !props.pending && onSwitchLanguage(value as CodeLanguage)}
      />
      {props.elementAfterLanguageSelect}
      {codeLanguageOptions[props.language as CodeLanguage].map(option => {
        switch (option.type) {
          case CodeLanguageOptionType.Select:
            return (
              <Form.Select
                className={props.classNameForLanguageOptions}
                key={option.name}
                label={_(`.${props.language}.options.${option.name}.name`)}
                value={props.languageOptions[option.name] as string}
                options={option.values.map(value => ({
                  key: value,
                  value: value,
                  text: _(`.${props.language}.options.${option.name}.values.${value}`)
                }))}
                onChange={(e, { value }) =>
                  !props.pending &&
                  props.onUpdateLanguageOptions(Object.assign({}, props.languageOptions, { [option.name]: value }))
                }
              />
            );
        }
      })}
    </>
  );
};

CodeLanguageAndOptions = observer(CodeLanguageAndOptions);

export default CodeLanguageAndOptions;

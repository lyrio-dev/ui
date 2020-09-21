import React, { useRef } from "react";
import { Form } from "semantic-ui-react";
import { observer } from "mobx-react";

import { useIntlMessage } from "@/utils/hooks";
import {
  compileAndRunOptions,
  CodeLanguageOptionType,
  CodeLanguage,
  getPreferredCompileAndRunOptions
} from "@/interfaces/CodeLanguage";

interface CodeLanguageAndOptionsProps {
  pending?: boolean;
  elementAfterLanguageSelect?: React.ReactNode;
  headerForLanguage?: string;
  classNameForLanguage?: string;
  classNameForCompileAndRunOptions?: string;
  language: CodeLanguage;
  compileAndRunOptions: Record<string, unknown>;
  onUpdateLanguage: (newLanguage: CodeLanguage) => void;
  onUpdateCompileAndRunOptions: (newCompileAndRunOptions: Record<string, unknown>) => void;
}

let CodeLanguageAndOptions: React.FC<CodeLanguageAndOptionsProps> = props => {
  const _ = useIntlMessage("code_language");

  const compileAndRunOptionsBackup = useRef(new Map<CodeLanguage, Record<string, unknown>>()).current;
  function onSwitchLanguage(newLanguage: CodeLanguage) {
    const oldLanguage = props.language;
    compileAndRunOptionsBackup.set(oldLanguage, props.compileAndRunOptions);
    props.onUpdateLanguage(newLanguage);
    props.onUpdateCompileAndRunOptions(
      compileAndRunOptionsBackup.get(newLanguage) || getPreferredCompileAndRunOptions(newLanguage)
    );
  }

  return (
    <>
      <Form.Select
        className={props.classNameForLanguage}
        label={props.headerForLanguage || _(".code_language")}
        value={props.language}
        options={Object.keys(compileAndRunOptions).map(language => ({
          key: language,
          value: language,
          text: _(`.${language}.name`)
        }))}
        onChange={(e, { value }) => !props.pending && onSwitchLanguage(value as CodeLanguage)}
      />
      {props.elementAfterLanguageSelect}
      {compileAndRunOptions[props.language as CodeLanguage].map(option => {
        switch (option.type) {
          case CodeLanguageOptionType.Select:
            return (
              <Form.Select
                className={props.classNameForCompileAndRunOptions}
                key={option.name}
                label={_(`.${props.language}.options.${option.name}.name`)}
                value={props.compileAndRunOptions[option.name] as string}
                options={option.values.map(value => ({
                  key: value,
                  value: value,
                  text: _(`.${props.language}.options.${option.name}.values.${value}`)
                }))}
                onChange={(e, { value }) =>
                  !props.pending &&
                  props.onUpdateCompileAndRunOptions(
                    Object.assign({}, props.compileAndRunOptions, { [option.name]: value })
                  )
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

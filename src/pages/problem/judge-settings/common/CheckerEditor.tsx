import React, { useRef } from "react";
import { Header, Menu, Form, Input, Segment } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./CheckerEditor.module.less";

import { useIntlMessage } from "@/utils/hooks";
import {
  CodeLanguage,
  filterValidLanguageOptions,
  getPreferredCodeLanguageOptions,
  checkCodeFileExtension,
  codeLanguageOptions,
  CodeLanguageOptionType
} from "@/interfaces/CodeLanguage";
import TestDataFileSelector from "./TestDataFileSelector";
import { JudgeInfoProcessor, EditorComponentProps } from "./interface";

interface CheckerTypeIntegers {
  type: "integers";
}

interface CheckerTypeFloats {
  type: "floats";
  precision: number;
}

interface CheckerTypeLines {
  type: "lines";
  caseSensitive: boolean;
}

interface CheckerTypeBinary {
  type: "binary";
}

interface CheckerTypeCustom {
  type: "custom";
  interface: string;
  language: CodeLanguage;
  languageOptions: Record<string, unknown>;
  filename: string;
  timeLimit?: number;
  memoryLimit?: number;
}

type CheckerConfig = CheckerTypeIntegers | CheckerTypeFloats | CheckerTypeLines | CheckerTypeBinary | CheckerTypeCustom;
type CheckerType = CheckerConfig["type"];

const CHECKER_TYPES: CheckerType[] = ["integers", "floats", "lines", "binary", "custom"];
const CUSTOM_CHECKER_INTERFACES = ["testlib", "legacy", "lemon", "hustoj", "qduoj", "domjudge"];

function parseCheckerConfig(checker: Partial<CheckerConfig>, testData: ApiTypes.ProblemFileDto[]): CheckerConfig {
  if (!checker || !CHECKER_TYPES.includes(checker.type))
    return {
      // default
      type: "lines",
      caseSensitive: false
    };

  switch (checker.type) {
    case "integers":
      return { type: "integers" };
    case "floats":
      return {
        type: "floats",
        precision: Number.isSafeInteger(checker.precision) && checker.precision > 0 ? checker.precision : 4
      };
    case "lines":
      return { type: "lines", caseSensitive: !!checker.caseSensitive };
    case "binary":
      return { type: "binary" };
    case "custom":
      const language = Object.values(CodeLanguage).includes(checker.language)
        ? checker.language
        : Object.values(CodeLanguage)[0];
      return {
        type: "custom",
        interface: CUSTOM_CHECKER_INTERFACES.includes(checker.interface)
          ? checker.interface
          : CUSTOM_CHECKER_INTERFACES[0],
        language: language,
        languageOptions:
          language === checker.language
            ? filterValidLanguageOptions(language, checker.languageOptions)
            : getPreferredCodeLanguageOptions(language),
        filename:
          checker.filename && typeof checker.filename === "string"
            ? checker.filename
            : (testData.find(file => checkCodeFileExtension(language, file.filename)) || testData[0] || {}).filename ||
              "",
        timeLimit: Number.isSafeInteger(checker.timeLimit) ? checker.timeLimit : null,
        memoryLimit: Number.isSafeInteger(checker.memoryLimit) ? checker.memoryLimit : null
      };
  }
}

export interface JudgeInfoWithChecker {
  checker?: CheckerConfig;
}

type CheckerEditorProps = EditorComponentProps<JudgeInfoWithChecker>;

let CheckerEditor: React.FC<CheckerEditorProps> = props => {
  const _ = useIntlMessage();

  const checker = props.judgeInfo.checker;

  function onUpdateChecker(delta: Partial<CheckerConfig>) {
    props.onUpdateJudgeInfo({
      checker: Object.assign({}, checker, delta)
    });
  }

  const checkerConfigBackup = useRef<Map<CheckerType, CheckerConfig>>(new Map()).current;
  function onChangeCheckerType(type: CheckerType) {
    if (props.pending) return;

    if (type === checker.type) return;
    checkerConfigBackup.set(checker.type, checker);

    props.onUpdateJudgeInfo({ checker: checkerConfigBackup.get(type) || parseCheckerConfig({ type }, props.testData) });
  }

  return (
    <Form className={style.wrapper}>
      <div className={style.menuWrapper}>
        <Header size="tiny" content={_("problem_judge_settings.checker.checker")} />
        <Menu secondary pointing>
          {CHECKER_TYPES.map(type => (
            <Menu.Item
              key={type}
              content={_(`problem_judge_settings.checker.types.${type}`)}
              active={checker.type === type}
              onClick={() => checker.type !== type && onChangeCheckerType(type)}
            />
          ))}
        </Menu>
      </div>
      <Segment color="grey" className={style.checkerConfig}>
        {(() => {
          switch (checker.type) {
            case "integers":
              return null;
            case "floats":
              return (
                <>
                  <Form.Field width={8}>
                    <label>{_(`problem_judge_settings.checker.config.floats.precision`)}</label>
                    <Input
                      value={checker.precision}
                      onChange={(e, { value }) =>
                        (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) > 0)) &&
                        onUpdateChecker({ precision: Number(value) })
                      }
                    />
                  </Form.Field>
                  <div className={style.description}>
                    {_("problem_judge_settings.checker.config.floats.description", {
                      value: `1e-${checker.precision}`
                    })}
                  </div>
                </>
              );
            case "lines":
              return (
                <>
                  <Form.Checkbox
                    toggle
                    label={_(`problem_judge_settings.checker.config.lines.case_sensitive`)}
                    checked={checker.caseSensitive}
                    onChange={(e, { checked }) => onUpdateChecker({ caseSensitive: checked })}
                  />
                  <div className={style.description}>
                    {_("problem_judge_settings.checker.config.lines.description")}
                  </div>
                </>
              );
            case "binary":
              return null;
            case "custom":
              const setLanguageOption = (name: string, value: unknown) => {
                onUpdateChecker({
                  languageOptions: Object.assign({}, checker.languageOptions, {
                    [name]: value
                  })
                });
              };
              return (
                <div className={style.custom}>
                  <TestDataFileSelector
                    type="FormSelect"
                    label={_("problem_judge_settings.checker.config.custom.filename")}
                    placeholder={_("problem_judge_settings.checker.config.custom.filename_no_file")}
                    value={checker.filename}
                    testData={props.testData}
                    onChange={value => onUpdateChecker({ filename: value })}
                  />
                  <Form.Group>
                    <Form.Select
                      width={8}
                      label={_("problem_judge_settings.checker.config.custom.interface")}
                      value={checker.interface}
                      options={CUSTOM_CHECKER_INTERFACES.map(iface => ({
                        key: iface,
                        value: iface,
                        text: _(`problem_judge_settings.checker.config.custom.interfaces.${iface}`)
                      }))}
                      onChange={(e, { value }) => onUpdateChecker({ interface: value as any })}
                    />
                    <Form.Select
                      width={8}
                      label={_("problem_judge_settings.checker.config.custom.language")}
                      value={checker.language}
                      options={Object.keys(codeLanguageOptions).map(language => ({
                        key: language,
                        value: language,
                        text: _(`code_language.${language}.name`)
                      }))}
                      onChange={(e, { value }) => onUpdateChecker({ language: value as CodeLanguage })}
                    />
                  </Form.Group>
                  <div className={style.languageOptions}>
                    {codeLanguageOptions[checker.language].map(option => {
                      switch (option.type) {
                        case CodeLanguageOptionType.Select:
                          return (
                            <Form.Select
                              key={option.name}
                              label={_(`code_language.${checker.language}.options.${option.name}.name`)}
                              fluid
                              value={
                                checker.languageOptions[option.name] == null
                                  ? option.defaultValue
                                  : (checker.languageOptions[option.name] as string)
                              }
                              options={option.values.map(value => ({
                                key: value,
                                value: value,
                                text: _(`code_language.${checker.language}.options.${option.name}.values.${value}`)
                              }))}
                              onChange={(e, { value }) => setLanguageOption(option.name, value)}
                            />
                          );
                      }
                    })}
                  </div>
                  <Form.Group>
                    <Form.Field width={8}>
                      <label>{_("problem_judge_settings.meta.time_limit")}</label>
                      <Input
                        className={style.labeledInput}
                        placeholder={props.judgeInfo["timeLimit"]}
                        value={checker.timeLimit == null ? "" : checker.timeLimit}
                        label="ms"
                        labelPosition="right"
                        icon="clock"
                        iconPosition="left"
                        onChange={(e, { value }) =>
                          (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                          onUpdateChecker({ timeLimit: value === "" ? null : Number(value) })
                        }
                      />
                    </Form.Field>
                    <Form.Field width={8}>
                      <label>{_("problem_judge_settings.meta.memory_limit")}</label>
                      <Input
                        className={style.labeledInput}
                        placeholder={props.judgeInfo["memoryLimit"]}
                        value={checker.memoryLimit == null ? "" : checker.memoryLimit}
                        label="MiB"
                        labelPosition="right"
                        icon="microchip"
                        iconPosition="left"
                        onChange={(e, { value }) =>
                          (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                          onUpdateChecker({ memoryLimit: value === "" ? null : Number(value) })
                        }
                      />
                    </Form.Field>
                  </Form.Group>
                </div>
              );
          }
        })()}
      </Segment>
    </Form>
  );
};

CheckerEditor = observer(CheckerEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoWithChecker> = {
  parseJudgeInfo(raw, testData) {
    return {
      checker: parseCheckerConfig(raw.checker, testData)
    };
  },
  normalizeJudgeInfo(judgeInfo) {
    if (judgeInfo.checker.type === "custom") {
      if (judgeInfo.checker.timeLimit == null) delete judgeInfo.checker.timeLimit;
      if (judgeInfo.checker.memoryLimit == null) delete judgeInfo.checker.memoryLimit;
    }
  }
};

export default Object.assign(CheckerEditor, judgeInfoProcessor);

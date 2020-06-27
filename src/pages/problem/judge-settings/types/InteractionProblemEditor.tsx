import React from "react";
import { observer } from "mobx-react";

import style from "./InteractionProblemEditor.module.less";

import { JudgeInfoProcessor, EditorComponentProps, Options } from "../common/interface";

import MetaEditor, { JudgeInfoWithMeta } from "../common/MetaEditor";
import SubtasksEditor, { JudgeInfoWithSubtasks } from "../common/SubtasksEditor";
import ExtraSourceFilesEditor, { JudgeInfoWithExtraSourceFiles } from "../common/ExtraSourceFilesEditor";
import {
  CodeLanguage,
  filterValidLanguageOptions,
  getPreferredCodeLanguageOptions,
  checkCodeFileExtension,
  codeLanguageOptions,
  CodeLanguageOptionType
} from "@/interfaces/CodeLanguage";
import { useIntlMessage } from "@/utils/hooks";
import { Segment, Form, Header, Menu, Input } from "semantic-ui-react";
import TestDataFileSelector from "../common/TestDataFileSelector";

const metaEditorOptions: Options<typeof MetaEditor> = {
  enableTimeMemoryLimit: true,
  enableFileIo: false,
  enableRunSamples: true
};

const subtasksEditorOptions: Options<typeof SubtasksEditor> = {
  enableTimeMemoryLimit: true,
  enableOutputFile: false
};

type InteractorInterface = "stdio" | "shm";

interface InteractorConfig {
  interface: InteractorInterface;
  sharedMemorySize?: number;
  language: CodeLanguage;
  languageOptions: Record<string, unknown>;
  filename: string;
  timeLimit?: number;
  memoryLimit?: number;
}

interface JudgeInfoWithInteractor {
  interactor: InteractorConfig;
}

export type JudgeInfoInteraction = JudgeInfoWithMeta &
  JudgeInfoWithSubtasks &
  JudgeInfoWithInteractor &
  JudgeInfoWithExtraSourceFiles;
type InteractionProblemEditorProps = EditorComponentProps<JudgeInfoInteraction>;

function parseInteractorConfig(
  interactor: Partial<InteractorConfig>,
  testData: ApiTypes.ProblemFileDto[]
): InteractorConfig {
  const language = Object.values(CodeLanguage).includes(interactor.language)
    ? interactor.language
    : Object.values(CodeLanguage)[0];
  return {
    interface: ["stdio", "shm"].includes(interactor.interface) ? interactor.interface : "stdio",
    sharedMemorySize:
      interactor.interface !== "shm"
        ? null
        : Number.isSafeInteger(interactor.sharedMemorySize) &&
          interactor.sharedMemorySize >= 4 &&
          interactor.sharedMemorySize <= 128
        ? interactor.sharedMemorySize
        : 4,
    language: language,
    languageOptions:
      language === interactor.language
        ? filterValidLanguageOptions(language, interactor.languageOptions)
        : getPreferredCodeLanguageOptions(language),
    filename:
      interactor.filename && typeof interactor.filename === "string"
        ? interactor.filename
        : (testData.find(file => checkCodeFileExtension(language, file.filename)) || testData[0] || {}).filename || "",
    timeLimit: Number.isSafeInteger(interactor.timeLimit) ? interactor.timeLimit : null,
    memoryLimit: Number.isSafeInteger(interactor.memoryLimit) ? interactor.memoryLimit : null
  };
}

let InteractionProblemEditor: React.FC<InteractionProblemEditorProps> = props => {
  const _ = useIntlMessage();

  const interactorInterfaces: InteractorInterface[] = ["stdio", "shm"];
  const interactor = props.judgeInfo.interactor;
  function onUpdateInteractor(delta: Partial<InteractorConfig>) {
    props.onUpdateJudgeInfo({
      interactor: Object.assign({}, interactor, delta)
    });
  }

  const setLanguageOption = (name: string, value: unknown) => {
    onUpdateInteractor({
      languageOptions: Object.assign({}, interactor.languageOptions, {
        [name]: value
      })
    });
  };

  const normalizeSharedMemorySize = (x: number) => {
    x = Math.round(x);
    if (x < 4) return 4;
    if (x > 128) return 128;
    return x;
  };

  return (
    <>
      <MetaEditor {...props} options={metaEditorOptions} />
      <Form className={style.wrapper}>
        <div className={style.menuWrapper}>
          <Header size="tiny" content={_("problem_judge_settings.interactor.interactor")} />
          <Menu secondary pointing>
            {interactorInterfaces.map(interactorInterface => (
              <Menu.Item
                key={interactorInterface}
                content={_(`problem_judge_settings.interactor.interfaces.${interactorInterface}`)}
                active={interactor.interface === interactorInterface}
                onClick={() =>
                  interactor.interface !== interactorInterface &&
                  onUpdateInteractor({
                    interface: interactorInterface,
                    sharedMemorySize: interactorInterface === "shm" ? 4 : null
                  })
                }
              />
            ))}
          </Menu>
        </div>
        <Segment color="grey" className={style.checkerConfig}>
          <div className={style.custom}>
            <TestDataFileSelector
              type="FormSelect"
              label={_("problem_judge_settings.interactor.filename")}
              placeholder={_("problem_judge_settings.interactor.filename_no_file")}
              value={interactor.filename}
              testData={props.testData}
              onChange={value => onUpdateInteractor({ filename: value })}
            />
            <Form.Group>
              <Form.Select
                width={8}
                label={_("problem_judge_settings.interactor.language")}
                value={interactor.language}
                options={Object.keys(codeLanguageOptions).map(language => ({
                  key: language,
                  value: language,
                  text: _(`code_language.${language}.name`)
                }))}
                onChange={(e, { value }) => onUpdateInteractor({ language: value as CodeLanguage })}
              />
              {interactor.interface === "shm" && (
                <Form.Field width={8}>
                  <label>{_("problem_judge_settings.interactor.shm_size")}</label>
                  <Input
                    value={normalizeSharedMemorySize(interactor.sharedMemorySize)}
                    type="number"
                    min={4}
                    max={128}
                    label="MiB"
                    labelPosition="right"
                    onChange={(e, { value }) =>
                      onUpdateInteractor({
                        sharedMemorySize: normalizeSharedMemorySize(Number(value))
                      })
                    }
                  />
                </Form.Field>
              )}
            </Form.Group>
            <div className={style.languageOptions}>
              {codeLanguageOptions[interactor.language].map(option => {
                switch (option.type) {
                  case CodeLanguageOptionType.Select:
                    return (
                      <Form.Select
                        label={_(`code_language.${interactor.language}.options.${option.name}.name`)}
                        fluid
                        value={
                          interactor.languageOptions[option.name] == null
                            ? option.defaultValue
                            : (interactor.languageOptions[option.name] as string)
                        }
                        options={option.values.map(value => ({
                          key: value,
                          value: value,
                          text: _(`code_language.${interactor.language}.options.${option.name}.values.${value}`)
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
                  value={interactor.timeLimit == null ? "" : interactor.timeLimit}
                  label="ms"
                  labelPosition="right"
                  icon="clock"
                  iconPosition="left"
                  onChange={(e, { value }) =>
                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                    onUpdateInteractor({ timeLimit: value === "" ? null : Number(value) })
                  }
                />
              </Form.Field>
              <Form.Field width={8}>
                <label>{_("problem_judge_settings.meta.memory_limit")}</label>
                <Input
                  className={style.labeledInput}
                  placeholder={props.judgeInfo["memoryLimit"]}
                  value={interactor.memoryLimit == null ? "" : interactor.memoryLimit}
                  label="MiB"
                  labelPosition="right"
                  icon="microchip"
                  iconPosition="left"
                  onChange={(e, { value }) =>
                    (value === "" || (Number.isSafeInteger(Number(value)) && Number(value) >= 0)) &&
                    onUpdateInteractor({ memoryLimit: value === "" ? null : Number(value) })
                  }
                />
              </Form.Field>
            </Form.Group>
          </div>
        </Segment>
      </Form>
      <SubtasksEditor {...props} options={subtasksEditorOptions} />
      <ExtraSourceFilesEditor {...props} />
    </>
  );
};

InteractionProblemEditor = observer(InteractionProblemEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoInteraction> = {
  parseJudgeInfo(raw, testData) {
    return Object.assign(
      {},
      MetaEditor.parseJudgeInfo(raw, testData, metaEditorOptions),
      {
        interactor: parseInteractorConfig(raw.interactor || {}, testData)
      },
      SubtasksEditor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
      ExtraSourceFilesEditor.parseJudgeInfo(raw, testData)
    );
  },
  normalizeJudgeInfo(judgeInfo) {
    MetaEditor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
    if (!judgeInfo.interactor.sharedMemorySize) delete judgeInfo.interactor.sharedMemorySize;
    if (judgeInfo.interactor.timeLimit == null) delete judgeInfo.interactor.timeLimit;
    if (judgeInfo.interactor.memoryLimit == null) delete judgeInfo.interactor.memoryLimit;
    SubtasksEditor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    ExtraSourceFilesEditor.normalizeJudgeInfo(judgeInfo);
  }
};

export default Object.assign(InteractionProblemEditor, judgeInfoProcessor);

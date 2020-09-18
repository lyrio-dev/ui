import React from "react";
import { observer } from "mobx-react";

import { JudgeInfoProcessor, EditorComponentProps, Options } from "../common/interface";

import MetaEditor, { JudgeInfoWithMeta } from "../common/MetaEditor";
import SubtasksEditor, { JudgeInfoWithSubtasks } from "../common/SubtasksEditor";
import CheckerEditor, { JudgeInfoWithChecker } from "../common/CheckerEditor";

const metaEditorOptions: Options<typeof MetaEditor> = {
  enableTimeMemoryLimit: false,
  enableFileIo: false,
  enableRunSamples: false
};

const subtasksEditorOptions: Options<typeof SubtasksEditor> = {
  enableTimeMemoryLimit: false,
  enableInputFile: "optional",
  enableOutputFile: true,
  enableUserOutputFilename: true
};

export type JudgeInfoSubmitAnswer = JudgeInfoWithMeta & JudgeInfoWithSubtasks & JudgeInfoWithChecker;
type SubmitAnswerProblemEditorProps = EditorComponentProps<JudgeInfoSubmitAnswer>;

let SubmitAnswerProblemEditor: React.FC<SubmitAnswerProblemEditorProps> = props => {
  return (
    <>
      <MetaEditor {...props} options={metaEditorOptions} />
      <CheckerEditor {...props} />
      <SubtasksEditor {...props} options={subtasksEditorOptions} />
    </>
  );
};

SubmitAnswerProblemEditor = observer(SubmitAnswerProblemEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfoSubmitAnswer> = {
  parseJudgeInfo(raw, testData) {
    return Object.assign(
      {},
      MetaEditor.parseJudgeInfo(raw, testData, metaEditorOptions),
      CheckerEditor.parseJudgeInfo(raw, testData),
      SubtasksEditor.parseJudgeInfo(raw, testData, subtasksEditorOptions)
    );
  },
  normalizeJudgeInfo(judgeInfo) {
    MetaEditor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
    CheckerEditor.normalizeJudgeInfo(judgeInfo);
    SubtasksEditor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
  }
};

export default Object.assign(SubmitAnswerProblemEditor, judgeInfoProcessor);

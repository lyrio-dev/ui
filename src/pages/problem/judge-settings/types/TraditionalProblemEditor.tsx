import React from "react";
import { observer } from "mobx-react";

import { JudgeInfoProcessor, EditorComponentProps, Options } from "../common/interface";

import MetaEditor, { JudgeInfoWithMeta } from "../common/MetaEditor";
import SubtasksEditor, { JudgeInfoWithSubtasks } from "../common/SubtasksEditor";
import CheckerEditor, { JudgeInfoWithChecker } from "../common/CheckerEditor";
import ExtraSourceFilesEditor, { JudgeInfoWithExtraSourceFiles } from "../common/ExtraSourceFilesEditor";

const metaEditorOptions: Options<typeof MetaEditor> = {
  enableTimeMemoryLimit: true,
  enableFileIo: true,
  enableRunSamples: true
};

const subtasksEditorOptions: Options<typeof SubtasksEditor> = {
  enableTimeMemoryLimit: true,
  enableInputFile: true,
  enableOutputFile: true
};

type JudgeInfo = JudgeInfoWithMeta & JudgeInfoWithSubtasks & JudgeInfoWithChecker & JudgeInfoWithExtraSourceFiles;
type TraditionalProblemEditorProps = EditorComponentProps<JudgeInfo>;

let TraditionalProblemEditor: React.FC<TraditionalProblemEditorProps> = props => {
  return (
    <>
      <MetaEditor {...props} options={metaEditorOptions} />
      <CheckerEditor {...props} />
      <SubtasksEditor {...props} options={subtasksEditorOptions} />
      <ExtraSourceFilesEditor {...props} />
    </>
  );
};

TraditionalProblemEditor = observer(TraditionalProblemEditor);

const judgeInfoProcessor: JudgeInfoProcessor<JudgeInfo> = {
  parseJudgeInfo(raw, testData) {
    return Object.assign(
      {},
      MetaEditor.parseJudgeInfo(raw, testData, metaEditorOptions),
      CheckerEditor.parseJudgeInfo(raw, testData),
      SubtasksEditor.parseJudgeInfo(raw, testData, subtasksEditorOptions),
      ExtraSourceFilesEditor.parseJudgeInfo(raw, testData)
    );
  },
  normalizeJudgeInfo(judgeInfo) {
    MetaEditor.normalizeJudgeInfo(judgeInfo, metaEditorOptions);
    CheckerEditor.normalizeJudgeInfo(judgeInfo);
    SubtasksEditor.normalizeJudgeInfo(judgeInfo, subtasksEditorOptions);
    ExtraSourceFilesEditor.normalizeJudgeInfo(judgeInfo);
  }
};

export default Object.assign(TraditionalProblemEditor, judgeInfoProcessor);

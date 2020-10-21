import React from "react";

import { useLocalizer } from "@/utils/hooks";
import { OmittableAnsiCodeBox, OmittableString } from "@/components/CodeBox";
import { ProblemTypeSubmissionViewProps, ProblemTypeSubmissionViewHelper } from "../common/interface";

interface SubmissionTestcaseResultSubmitAnswer {
  testcaseInfo: {
    inputFile: string;
    outputFile: string;
    userOutputFilename: string;
  };
  status: string;
  score: number;
  input?: OmittableString;
  output?: OmittableString;
  userOutput?: OmittableString;
  userOutputLength?: number;
  checkerMessage?: OmittableString;
  systemMessage?: OmittableString;
}

interface SubmissionContentSubmitAnswer {}

type SubmitAnswerProblemSubmissionViewProps = ProblemTypeSubmissionViewProps<
  SubmissionTestcaseResultSubmitAnswer,
  SubmissionContentSubmitAnswer
>;

const SubmitAnswerProblemSubmissionView: React.FC<SubmitAnswerProblemSubmissionViewProps> = props => {
  const _ = useLocalizer("submission");

  return (
    <>
      {props.getCompilationMessage()}
      {props.getSystemMessage()}
      {props.getSubtasksView(testcaseResult => (
        <OmittableAnsiCodeBox title={_(".testcase.checker_message")} ansiMessage={testcaseResult.checkerMessage} />
      ))}
    </>
  );
};

const helper: ProblemTypeSubmissionViewHelper<SubmissionContentSubmitAnswer> = {
  config: {
    hideTimeMemory: true
  },
  getDownloadAnswerFilename(meta) {
    return `answer_${meta.id}.zip`;
  }
};

export default Object.assign(SubmitAnswerProblemSubmissionView, helper);

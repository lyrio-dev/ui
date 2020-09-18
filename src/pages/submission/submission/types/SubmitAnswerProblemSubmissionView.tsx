import React from "react";

import { useIntlMessage } from "@/utils/hooks";
import { CodeBox } from "@/components/CodeBox";
import { ProblemTypeSubmissionViewProps, ProblemTypeSubmissionViewHelper } from "../common/interface";

interface SubmissionTestcaseResultSubmitAnswer {
  testcaseInfo: {
    inputFile: string;
    outputFile: string;
    userOutputFilename: string;
  };
  status: string;
  score: number;
  input?: string;
  output?: string;
  userOutput?: string;
  userOutputLength?: number;
  checkerMessage?: string;
  systemMessage?: string;
}

interface SubmissionContentSubmitAnswer {}

type SubmitAnswerProblemSubmissionViewProps = ProblemTypeSubmissionViewProps<
  SubmissionTestcaseResultSubmitAnswer,
  SubmissionContentSubmitAnswer
>;

const SubmitAnswerProblemSubmissionView: React.FC<SubmitAnswerProblemSubmissionViewProps> = props => {
  const _ = useIntlMessage("submission");

  return (
    <>
      {props.getCompilationMessage()}
      {props.getSystemMessage()}
      {props.getSubtasksView(testcaseResult => (
        <CodeBox title={_(".testcase.checker_message")} content={testcaseResult.checkerMessage} />
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

import React from "react";

import style from "../SubmissionPage.module.less";

import { useIntlMessage } from "@/utils/hooks";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { CodeBox } from "@/components/CodeBox";
import { ProblemTypeSubmissionViewProps, ProblemTypeSubmissionViewHelper } from "../common/interface";
import FormattableCodeBox from "../common/FormattableCodeBox";

interface SubmissionTestcaseResultInteraction {
  testcaseInfo: {
    timeLimit: number;
    memoryLimit: number;
    inputFilename: string;
    outputFilename: string;
  };
  status: string;
  score: number;
  time?: number;
  memory?: number;
  input?: string;
  output?: string;
  userOutput?: string;
  userError?: string;
  interactorMessage?: string;
  systemMessage?: string;
}

interface SubmissionContentInteraction {
  language: CodeLanguage;
  code: string;
  languageOptions: Record<string, string>;
}

type InteractionProblemSubmissionViewProps = ProblemTypeSubmissionViewProps<
  SubmissionTestcaseResultInteraction,
  SubmissionContentInteraction
>;

const InteractionProblemSubmissionView: React.FC<InteractionProblemSubmissionViewProps> = props => {
  const _ = useIntlMessage();

  return (
    <>
      <FormattableCodeBox code={props.content.code} language={props.content.language} />
      {props.getCompilationMessage()}
      {props.getSystemMessage()}
      {props.getSubtasksView(testcaseResult => (
        <CodeBox title={_("submission.testcase.interactor_message")} content={testcaseResult.interactorMessage} />
      ))}
    </>
  );
};

const helper: ProblemTypeSubmissionViewHelper<SubmissionContentInteraction> = {
  getAnswerInfo(content, _) {
    return (
      <>
        <table className={style.languageOptions}>
          <tbody>
            {Object.entries(content.languageOptions).map(([name, value]) => (
              <tr key={name}>
                <td align="right" className={style.languageOptionsName}>
                  <strong>{_(`code_language.${content.language}.options.${name}.name`)}</strong>
                </td>
                <td>{_(`code_language.${content.language}.options.${name}.values.${value}`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  },
  getHighlightLanguageList(content) {
    return [content.language];
  }
};

export default Object.assign(InteractionProblemSubmissionView, helper);

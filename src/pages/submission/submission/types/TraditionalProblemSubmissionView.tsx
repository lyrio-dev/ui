import React from "react";

import style from "../SubmissionPage.module.less";

import { useLocalizer } from "@/utils/hooks";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { OmittableAnsiCodeBox, OmittableString } from "@/components/CodeBox";
import { ProblemTypeSubmissionViewProps, ProblemTypeSubmissionViewHelper } from "../common/interface";
import FormattableCodeBox from "../common/FormattableCodeBox";

interface SubmissionTestcaseResultTraditional {
  testcaseInfo: {
    timeLimit: number;
    memoryLimit: number;
    inputFile: string;
    outputFile: string;
  };
  status: string;
  score: number;
  time?: number;
  memory?: number;
  input?: OmittableString;
  output?: OmittableString;
  userOutput?: OmittableString;
  userError?: OmittableString;
  checkerMessage?: OmittableString;
  systemMessage?: OmittableString;
}

interface SubmissionContentTraditional {
  language: CodeLanguage;
  code: string;
  compileAndRunOptions: Record<string, string>;
}

type TraditionalProblemSubmissionViewProps = ProblemTypeSubmissionViewProps<
  SubmissionTestcaseResultTraditional,
  SubmissionContentTraditional
>;

const TraditionalProblemSubmissionView: React.FC<TraditionalProblemSubmissionViewProps> = props => {
  const _ = useLocalizer("submission");

  return (
    <>
      <FormattableCodeBox
        code={props.content.code}
        language={props.content.language}
        ref={props.refDefaultCopyCodeBox}
      />
      {props.getCompilationMessage()}
      {props.getSystemMessage()}
      {props.getSubtasksView(testcaseResult => (
        <OmittableAnsiCodeBox title={_(".testcase.checker_message")} ansiMessage={testcaseResult.checkerMessage} />
      ))}
    </>
  );
};

const helper: ProblemTypeSubmissionViewHelper<SubmissionContentTraditional> = {
  getAnswerInfo(content, _) {
    const entires = Object.entries(content.compileAndRunOptions);
    return entires.length ? (
      <>
        <table className={style.compileAndRunOptions}>
          <tbody>
            {entires.map(([name, value]) => (
              <tr key={name}>
                <td align="right" className={style.compileAndRunOptionsName}>
                  <strong>{_(`code_language.${content.language}.options.${name}.name`)}</strong>
                </td>
                <td>{_(`code_language.${content.language}.options.${name}.values.${value}`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    ) : null;
  },
  getHighlightLanguageList(content) {
    return [content.language];
  }
};

export default Object.assign(TraditionalProblemSubmissionView, helper);

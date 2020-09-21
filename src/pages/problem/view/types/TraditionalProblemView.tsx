import React from "react";
import { Icon, Label, Popup } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./TraditionalProblemView.module.less";

import { useIntlMessage } from "@/utils/hooks";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import CodeEditor from "@/components/LazyCodeEditor";

import { JudgeInfoTraditional } from "../../judge-settings/types/TraditionalProblemEditor";
import { ProblemTypeLabelsProps, ProblemTypeSubmitViewProps, ProblemTypeView } from "../common/interface";
import SubmitViewFrame from "../common/SubmitViewFrame";
import CodeLanguageAndOptions from "../common/CodeLanguageAndOptions";
import { getLimit } from "../common";

type TraditionalProblemLabelsProps = ProblemTypeLabelsProps<JudgeInfoTraditional>;

const TraditionalProblemLabels: React.FC<TraditionalProblemLabelsProps> = React.memo(props => {
  const _ = useIntlMessage("problem");

  const timeLimit = getLimit(props.judgeInfo, "timeLimit");
  const memoryLimit = getLimit(props.judgeInfo, "memoryLimit");
  const fileIo =
    props.judgeInfo && (props.judgeInfo as { fileIo: { inputFilename: string; outputFilename: string } }).fileIo;

  return (
    <>
      {timeLimit && (
        <Label size={props.size} color="pink">
          <Icon name="clock" />
          {timeLimit + " ms"}
        </Label>
      )}
      {memoryLimit && (
        <Label size={props.size} color="blue">
          <Icon name="microchip" />
          {memoryLimit + " MiB"}
        </Label>
      )}
      {fileIo && (
        <Popup
          trigger={
            <Label size={props.size} color="orange">
              <Icon name="file" />
              {_(`.fileio.fileio`)}
            </Label>
          }
          content={
            <table className={style.fileIo}>
              <tbody>
                <tr>
                  <td align="right" className={style.fileIoName}>
                    <strong>{_(`.fileio.input`)}</strong>
                  </td>
                  <td>{fileIo.inputFilename}</td>
                </tr>
                <tr>
                  <td align="right" className={style.fileIoName}>
                    <strong>{_(`.fileio.output`)}</strong>
                  </td>
                  <td>{fileIo.outputFilename}</td>
                </tr>
              </tbody>
            </table>
          }
          hoverable
          on="hover"
          position="bottom center"
        />
      )}
    </>
  );
});

interface SubmissionContent {
  language: CodeLanguage;
  code: string;
  compileAndRunOptions: any;
  skipSamples?: boolean;
}

type TraditionalProblemSubmitViewProps = ProblemTypeSubmitViewProps<JudgeInfoTraditional, SubmissionContent>;

let TraditionalProblemSubmitView: React.FC<TraditionalProblemSubmitViewProps> = props => {
  return (
    <>
      <SubmitViewFrame
        {...props}
        showSkipSamples={props.judgeInfo.runSamples}
        mainContent={
          <SubmitViewFrame.EditorWrapper>
            <CodeEditor
              language={props.submissionContent.language}
              value={props.submissionContent.code}
              onChange={newValue => props.onUpdateSubmissionContent("code", newValue)}
            />
          </SubmitViewFrame.EditorWrapper>
        }
        sidebarContent={
          <>
            <CodeLanguageAndOptions objectPath="" {...props} />
          </>
        }
        submitDisabled={!props.submissionContent.code}
      />
    </>
  );
};

TraditionalProblemSubmitView = observer(TraditionalProblemSubmitView);

const traditionalProblemViews: ProblemTypeView<JudgeInfoTraditional> = {
  Labels: TraditionalProblemLabels,
  SubmitView: TraditionalProblemSubmitView,
  getDefaultSubmissionContent: () =>
    Object.assign(
      {
        code: ""
      },
      CodeLanguageAndOptions.getDefault()
    ),
  enableStatistics: () => true
};

export default traditionalProblemViews;

import React from "react";
import { Icon, Label } from "semantic-ui-react";
import { observer } from "mobx-react";

import { CodeLanguage } from "@/interfaces/CodeLanguage";
import CodeEditor from "@/components/LazyCodeEditor";

import { JudgeInfoInteraction } from "../../judge-settings/types/InteractionProblemEditor";
import { ProblemTypeLabelsProps, ProblemTypeSubmitViewProps, ProblemTypeView } from "../common/interface";
import SubmitViewFrame from "../common/SubmitViewFrame";
import CodeLanguageAndOptions from "../common/CodeLanguageAndOptions";
import { getLimit } from "../common";

type InteractionProblemLabelsProps = ProblemTypeLabelsProps<JudgeInfoInteraction>;

const InteractionProblemLabels: React.FC<InteractionProblemLabelsProps> = React.memo(props => {
  const timeLimit = getLimit(props.judgeInfo, "timeLimit");
  const memoryLimit = getLimit(props.judgeInfo, "memoryLimit");

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
    </>
  );
});

interface SubmissionContent {
  language: CodeLanguage;
  code: string;
  languageOptions: any;
  skipSamples?: boolean;
}

type InteractionProblemSubmitViewProps = ProblemTypeSubmitViewProps<JudgeInfoInteraction, SubmissionContent>;

let InteractionProblemSubmitView: React.FC<InteractionProblemSubmitViewProps> = props => {
  return (
    <>
      <SubmitViewFrame
        {...props}
        showSkipSamples={props.judgeInfo.runSamples}
        mainContent={
          <>
            {SubmitViewFrame.wrapEditor(
              <CodeEditor
                language={props.submissionContent.language}
                value={props.submissionContent.code}
                onChange={newValue => props.onUpdateSubmissionContent("code", newValue)}
              />
            )}
          </>
        }
        sidebarContent={
          <>
            <CodeLanguageAndOptions objectPath="" {...props} />
          </>
        }
      />
    </>
  );
};

InteractionProblemSubmitView = observer(InteractionProblemSubmitView);

const interactionProblemViews: ProblemTypeView<JudgeInfoInteraction> = {
  Labels: InteractionProblemLabels,
  SubmitView: InteractionProblemSubmitView,
  getDefaultSubmissionContent: () =>
    Object.assign(
      {
        code: ""
      },
      CodeLanguageAndOptions.getDefault()
    )
};

export default interactionProblemViews;

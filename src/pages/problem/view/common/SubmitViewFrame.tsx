import React from "react";
import { Header, Menu, Button, Checkbox } from "semantic-ui-react";
import { Link } from "react-navi";
import { observer } from "mobx-react";

import style from "./SubmitViewFrame.module.less";

import { useIntlMessage } from "@/utils/hooks";
import StatusText from "@/components/StatusText";
import ScoreText from "@/components/ScoreText";

interface SubmitViewFrameProps {
  showSkipSamples: boolean;
  mainContent: React.ReactNode;
  sidebarContent: React.ReactNode;

  inSubmitView: boolean;
  pendingSubmit: boolean;
  lastSubmission: ApiTypes.ProblemLastSubmissionDto;
  submissionContent: unknown;
  onCloseSubmitView: () => void;
  onUpdateSubmissionContent: (path: string, value: unknown) => void;
  onSubmit: () => void;
}

let SubmitViewFrame: React.FC<SubmitViewFrameProps> = props => {
  const _ = useIntlMessage();

  return (
    <div className={style.submitView} style={{ display: props.inSubmitView ? null : "none" }}>
      <div className={style.leftContainer}>{props.mainContent}</div>
      <div className={style.rightContainer}>
        <Menu pointing secondary vertical className={style.actionMenu}>
          <Menu.Item name={_("problem.submit.back_to_statement")} icon="arrow left" onClick={props.onCloseSubmitView} />
          <div />
        </Menu>
        {props.sidebarContent}
        {props.showSkipSamples && (
          <Checkbox
            className={style.skipSamples}
            label={_("problem.submit.skip_samples")}
            checked={(props.submissionContent as any).skipSamples}
            onChange={(e, { checked }) => props.onUpdateSubmissionContent("skipSamples", checked)}
          />
        )}
        <Button
          className={style.submitButton}
          primary
          fluid
          icon="paper plane"
          loading={props.pendingSubmit}
          content={_("problem.submit.submit")}
          onClick={props.onSubmit}
        />
        {props.lastSubmission && props.lastSubmission.lastSubmission && (
          <div className={style.lastSubmission}>
            <Header size="tiny" content={_("problem.submit.last_submission")} />
            <Link href={`/submission/${props.lastSubmission.lastSubmission.id}`}>
              <StatusText status={props.lastSubmission.lastSubmission.status} />
            </Link>
            <Link className={style.scoreText} href={`/submission/${props.lastSubmission.lastSubmission.id}`}>
              <ScoreText score={props.lastSubmission.lastSubmission.score} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

SubmitViewFrame = observer(SubmitViewFrame);

export default Object.assign(SubmitViewFrame, {
  wrapEditor: (editor: React.ReactNode) => <div className={style.editorWrapper}>{editor}</div>
});

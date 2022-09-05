import React, { useState } from "react";
import { Table, Icon, Popup, Ref } from "semantic-ui-react";

import style from "./SubmissionItem.module.less";

import { useLocalizer, Link } from "@/utils/hooks";
import formatFileSize from "@/utils/formatFileSize";
import { friendlyFormatDateTime } from "@/utils/formatDateTime";
import UserLink from "@/components/UserLink";
import StatusText from "@/components/StatusText";
import ScoreText from "@/components/ScoreText";
import { CodeLanguage } from "@/interfaces/CodeLanguage";
import { getProblemDisplayName, getProblemIdString, getProblemUrl } from "@/pages/problem/utils";
import { EmojiRenderer } from "@/components/EmojiRenderer";

function parseSubmissionMeta(submission: ApiTypes.SubmissionMetaDto) {
  return {
    submission,
    submissionLink: `/s/${submission.id}`,
    timeString: friendlyFormatDateTime(submission.submitTime),
    problemIdString: getProblemIdString(submission.problem),
    problemUrl: getProblemUrl(submission.problem)
  };
}

interface SubmissionItemConfig {
  hideTimeMemory?: boolean;
}

interface SubmissionHeaderProps {
  page: "submission" | "submissions" | "statistics";
  config?: SubmissionItemConfig;
}

export const SubmissionHeader: React.FC<SubmissionHeaderProps> = props => {
  const _ = useLocalizer("submission_item");

  return (
    <Table.Row className={style[props.page + "Page"]}>
      <Table.HeaderCell className={style.columnStatus} textAlign="left">
        {_(".columns.status")}
      </Table.HeaderCell>
      <Table.HeaderCell className={style.columnScore}>{_(".columns.score")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnProblemAndSubmitter} textAlign="left">
        <div className={style.problem}>{_(".columns.problem")}</div>
        <div className={style.submitter}>{_(".columns.submitter")}</div>
      </Table.HeaderCell>
      {!props?.config?.hideTimeMemory && (
        <>
          <Table.HeaderCell className={style.columnTime}>{_(".columns.time")}</Table.HeaderCell>
          <Table.HeaderCell className={style.columnMemory}>{_(".columns.memory")}</Table.HeaderCell>
        </>
      )}
      <Table.HeaderCell className={style.columnAnswer}>{_(".columns.answer")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnSubmitTime}>{_(".columns.submit_time")}</Table.HeaderCell>
    </Table.Row>
  );
};

interface SubmissionItemProps {
  submission: ApiTypes.SubmissionMetaDto;
  page: "submission" | "submissions" | "statistics";

  // This is passed to <StatusText> to override the display text for status
  statusText?: string;

  // Mouse hover on "answer" column to display
  answerInfo?: React.ReactNode;

  // If passed, will show a download icon
  onDownloadAnswer?: () => void;

  // Mouse hover on "status" to display
  statusPopup?: (statusNode: React.ReactElement) => React.ReactNode;

  config?: SubmissionItemConfig;
}

export const SubmissionItem: React.FC<SubmissionItemProps> = props => {
  const _ = useLocalizer("submission_item");

  const { submission, submissionLink, timeString, problemIdString, problemUrl } = parseSubmissionMeta(props.submission);

  const [refAnswerInfoIcon, setRefAnswerInfoIcon] = useState<HTMLElement>();

  return (
    <Table.Row className={style[props.page + "Page"]}>
      {(props.statusPopup || (x => x))(
        <Table.Cell className={style.columnStatus} textAlign="left">
          <Link href={props.page !== "submission" ? submissionLink : null}>
            <StatusText status={submission.status} statusText={props.statusText} />
          </Link>
        </Table.Cell>
      )}
      <Table.Cell className={style.columnScore}>
        <Link href={props.page !== "submission" ? submissionLink : null}>
          <ScoreText score={submission.score || 0} />
        </Link>
      </Table.Cell>
      <Table.Cell className={style.columnProblemAndSubmitter} textAlign="left">
        <div className={style.problem}>
          <EmojiRenderer>
            <Link href={problemUrl}>{getProblemDisplayName(submission.problem, submission.problemTitle, _)}</Link>
          </EmojiRenderer>
        </div>
        <div className={style.submitter}>
          <UserLink user={submission.submitter} />
        </div>
      </Table.Cell>
      {!props?.config?.hideTimeMemory && (
        <>
          <Table.Cell className={style.columnTime}>{Math.round(submission.timeUsed || 0) + " ms"}</Table.Cell>
          <Table.Cell className={style.columnMemory} title={(submission.memoryUsed || 0) + " K"}>
            {formatFileSize((submission.memoryUsed || 0) * 1024, 1)}
          </Table.Cell>
        </>
      )}
      <Table.Cell className={style.columnAnswer}>
        <Popup
          className={style.popupOnIcon}
          context={refAnswerInfoIcon}
          content={props.answerInfo}
          disabled={!props.answerInfo}
          hoverable
          trigger={
            <span>
              {props.answerInfo && (
                <Ref innerRef={setRefAnswerInfoIcon}>
                  <Icon name="info circle" />
                </Ref>
              )}
              {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
                <>
                  {props.page !== "submission" ? (
                    <Link href={submissionLink}>{_(`code_language.${submission.codeLanguage}.name`)}</Link>
                  ) : (
                    _(`code_language.${submission.codeLanguage}.name`)
                  )}
                  &nbsp;/&nbsp;
                </>
              )}
              <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
              {props.onDownloadAnswer && (
                <Icon className={style.downloadIcon} name="download" onClick={props.onDownloadAnswer} />
              )}
            </span>
          }
          position="bottom center"
          on="hover"
        />
      </Table.Cell>
      <Table.Cell className={style.columnSubmitTime} title={timeString[1]}>
        {timeString[0]}
      </Table.Cell>
    </Table.Row>
  );
};

interface SubmissionHeaderMobileProps {
  importantField?: "timeUsed" | "memoryUsed";
}

export const SubmissionHeaderMobile: React.FC<SubmissionHeaderMobileProps> = props => {
  const _ = useLocalizer("submission_item");

  return (
    <Table.Row className={style.submissionItemMobile}>
      <Table.HeaderCell>
        <div className={style.flexContainer}>
          <div>
            <div>
              <span>
                <span>{_(".columns.status")}</span>
                <span className={style.headerScoreColumn}>{_(".columns.score")}</span>
              </span>
            </div>
            <div>{_(".columns.answer")}</div>
          </div>

          <div>
            <div>{_(".columns.problem")}</div>
            <div>
              <div>{_(".columns.submitter")}</div>
              <div>
                {_(
                  props.importantField === "timeUsed"
                    ? ".columns.time"
                    : props.importantField === "memoryUsed"
                    ? ".columns.memory"
                    : ".columns.submit_time"
                )}
              </div>
            </div>
          </div>
        </div>
      </Table.HeaderCell>
    </Table.Row>
  );
};

interface SubmissionItemMobileProps {
  submission: ApiTypes.SubmissionMetaDto;
  statusText?: string;
  importantField?: "timeUsed" | "memoryUsed";
}

// For mobile view of submissions page only
// Not for submission page and statistics page
export const SubmissionItemMobile: React.FC<SubmissionItemMobileProps> = props => {
  const _ = useLocalizer("submission_item");

  const { submission, submissionLink, timeString, problemIdString, problemUrl } = parseSubmissionMeta(props.submission);

  const importantField = props.importantField || "submitTime";

  return (
    <Table.Row className={style.submissionItemMobile}>
      <Table.Cell>
        <div className={style.flexContainer}>
          <div>
            <div>
              <Link href={submissionLink}>
                <StatusText status={submission.status} statusText={props.statusText} />
                <ScoreText score={submission.score || 0} />
              </Link>
            </div>
            <div>
              {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
                <>
                  <Link href={submissionLink}>{_(`code_language.${submission.codeLanguage}.name`)}</Link>
                  &nbsp;/&nbsp;
                </>
              )}
              <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
            </div>
          </div>

          <div>
            <div>
              <EmojiRenderer>
                <Link href={problemUrl}>{getProblemDisplayName(submission.problem, submission.problemTitle, _)}</Link>
              </EmojiRenderer>
            </div>
            <div>
              <div>
                <UserLink user={submission.submitter} />
              </div>
              {props.importantField === "timeUsed" ? (
                <div>{Math.round(submission.timeUsed || 0) + " ms"}</div>
              ) : props.importantField === "memoryUsed" ? (
                <div title={(submission.memoryUsed || 0) + " K"}>
                  {formatFileSize((submission.memoryUsed || 0) * 1024, 1)}
                </div>
              ) : (
                <div title={timeString[1]}>{timeString[0]}</div>
              )}
            </div>
          </div>
        </div>
      </Table.Cell>
    </Table.Row>
  );
};

// This is for the responsive view in submission page (not submissions page)
// < 1024 has one row
// < 768  has more rows
interface SubmissionItemExtraRowsProps {
  submission: ApiTypes.SubmissionMetaDto;
  isMobile: boolean;

  // Mouse hover on "answer" column to display
  answerInfo?: React.ReactNode;

  // If passed, will show a download icon
  onDownloadAnswer?: () => void;

  // Mouse hover on "status" to display
  statusPopup?: (statusNode: React.ReactElement) => React.ReactNode;

  config?: SubmissionItemConfig;
}

export const SubmissionItemExtraRows: React.FC<SubmissionItemExtraRowsProps> = props => {
  const _ = useLocalizer("submission_item");

  const { submission, timeString, problemIdString, problemUrl } = parseSubmissionMeta(props.submission);

  const columnStatus = (props.statusPopup || (x => x))(
    <div className={style.extraRowsColumnStatus}>
      <StatusText status={submission.status} />
    </div>
  );

  const columnScore = (
    <div className={style.extraRowsColumnScore}>
      <Icon name="clipboard check" />
      <ScoreText score={submission.score || 0} />
    </div>
  );

  const columnProblem = (
    <div className={style.extraRowsColumnProblem}>
      <Icon name="book" />
      <Link href={problemUrl}>{getProblemDisplayName(submission.problem, submission.problemTitle, _)}</Link>
    </div>
  );

  const columnSubmitter = (
    <div className={style.extraRowsColumnSubmitter}>
      <Icon name="user" />
      <UserLink user={submission.submitter} />
    </div>
  );

  const columnTime = (
    <div>
      <Icon name="time" />
      {Math.round(submission.timeUsed || 0) + " ms"}
    </div>
  );

  const columnMemory = (
    <div title={(submission.memoryUsed || 0) + " K"}>
      <Icon name="microchip" />
      {formatFileSize((submission.memoryUsed || 0) * 1024, 1)}
    </div>
  );

  const columnAnswer = (
    <Popup
      content={props.answerInfo}
      disabled={!props.answerInfo}
      position={props.isMobile ? "left center" : "bottom center"}
      on="hover"
      hoverable
      trigger={
        <div>
          <Icon name="file" />
          <span>
            {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
              <>
                {_(`code_language.${submission.codeLanguage}.name`)}
                &nbsp;/&nbsp;
              </>
            )}
            <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
          </span>
          {props.onDownloadAnswer && (
            <Icon className={style.downloadIcon} name="download" onClick={props.onDownloadAnswer} />
          )}
        </div>
      }
    />
  );

  const columnSubmitTime = (
    <div title={timeString[1] as string}>
      <Icon name="calendar" />
      {timeString[0]}
    </div>
  );

  return (
    <div className={style.extraRowsWrapper}>
      {props.isMobile ? (
        <>
          <div>
            {columnStatus}
            {columnScore}
          </div>
          <div>
            {columnProblem}
            {columnSubmitter}
          </div>
          <div>
            {columnTime}
            {columnAnswer}
          </div>
          {!props?.config?.hideTimeMemory && (
            <div>
              {columnMemory}
              {columnSubmitTime}
            </div>
          )}
        </>
      ) : (
        <>
          <div>
            {!props?.config?.hideTimeMemory && (
              <>
                {columnMemory}
                {columnSubmitTime}
              </>
            )}
            {columnAnswer}
            {columnSubmitTime}
          </div>
        </>
      )}
    </div>
  );
};

import React, { useRef } from "react";
import { Link } from "react-navi";
import { Table, Grid, Icon, Popup, Ref } from "semantic-ui-react";

import style from "./SubmissionItem.module.less";

import { useIntlMessage } from "@/utils/hooks";
import formatFileSize from "@/utils/formatFileSize";
import formatDateTime from "@/utils/formatDateTime";
import UserLink from "@/components/UserLink";
import StatusText from "@/components/StatusText";
import ScoreText from "@/components/ScoreText";
import { CodeLanguage } from "@/interfaces/CodeLanguage";

interface SubmissionItemProps {
  submission: ApiTypes.SubmissionMetaDto;
  page: "submission" | "submissions" | "statistics";
  statisticsField?: "Time" | "Memory" | "Answer" | "Submit";

  // This is passed to <StatusText> to override the display text for status
  statusText?: string;

  // Mouse hover on "answer" column to display
  answerInfo?: React.ReactNode;

  // Mouse hover on "status" to display
  statusPopup?: (statusNode: React.ReactElement) => React.ReactNode;
}

export const SubmissionItem: React.FC<SubmissionItemProps> = props => {
  const _ = useIntlMessage("submission_item");

  const submission = props.submission;
  const submissionLink = `/submission/${submission.id}`;
  const timeString = formatDateTime(submission.submitTime);

  const problemIdString = submission.problem.displayId
    ? "#" + submission.problem.displayId
    : "P" + submission.problem.id;
  const problemUrl = submission.problem.displayId
    ? `/problem/${submission.problem.displayId}`
    : `/problem/by-id/${submission.problem.id}`;

  const refAnswerInfoIcon = useRef<HTMLElement>();

  return (
    <Table.Row
      className={
        style[props.page + "Page"] +
        (props.statisticsField ? " " + style["statisticsType" + props.statisticsField] : "")
      }
    >
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
          <Link href={problemUrl}>
            {problemIdString}. {submission.problemTitle}
          </Link>
        </div>
        <div className={style.submitter}>
          <UserLink user={submission.submitter} />
        </div>
      </Table.Cell>
      <Table.Cell className={style.columnTime}>{Math.round(submission.timeUsed || 0) + " ms"}</Table.Cell>
      <Table.Cell className={style.columnMemory} title={(submission.memoryUsed || 0) + " K"}>
        {formatFileSize((submission.memoryUsed || 0) * 1024, 1)}
      </Table.Cell>
      <Table.Cell className={style.columnAnswer}>
        <Popup
          className={style.popupOnIcon}
          context={refAnswerInfoIcon}
          content={props.answerInfo}
          disabled={!props.answerInfo}
          trigger={
            <span>
              {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
                <>
                  {props.answerInfo && (
                    <Ref innerRef={refAnswerInfoIcon}>
                      <Icon name="info circle" />
                    </Ref>
                  )}
                  {props.page !== "submission" ? (
                    <Link href={submissionLink}>{_(`code_language.${submission.codeLanguage}.name`)}</Link>
                  ) : (
                    _(`code_language.${submission.codeLanguage}.name`)
                  )}
                  &nbsp;/&nbsp;
                </>
              )}
              <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
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

interface SubmissionHeaderProps {
  page: "submission" | "submissions" | "statistics";
  statisticsField?: "Time" | "Memory" | "Answer" | "Submit";
}

export const SubmissionHeader: React.FC<SubmissionHeaderProps> = props => {
  const _ = useIntlMessage("submission_item");

  return (
    <Table.Row
      className={
        style[props.page + "Page"] +
        (props.statisticsField ? " " + style["statisticsType" + props.statisticsField] : "")
      }
    >
      <Table.HeaderCell className={style.columnStatus} textAlign="left">
        {_(".columns.status")}
      </Table.HeaderCell>
      <Table.HeaderCell className={style.columnScore}>{_(".columns.score")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnProblemAndSubmitter} textAlign="left">
        <div className={style.problem}>{_(".columns.problem")}</div>
        <div className={style.submitter}>{_(".columns.submitter")}</div>
      </Table.HeaderCell>
      <Table.HeaderCell className={style.columnTime}>{_(".columns.time")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnMemory}>{_(".columns.memory")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnAnswer}>{_(".columns.answer")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnSubmitTime}>{_(".columns.submit_time")}</Table.HeaderCell>
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

  // Mouse hover on "status" to display
  statusPopup?: (statusNode: React.ReactElement) => React.ReactNode;
}

export const SubmissionItemExtraRows: React.FC<SubmissionItemExtraRowsProps> = props => {
  const _ = useIntlMessage("submission_item");

  const submission = props.submission;
  const timeString = formatDateTime(submission.submitTime);

  const problemIdString = submission.problem.displayId
    ? "#" + submission.problem.displayId
    : "P" + submission.problem.id;
  const problemUrl = submission.problem.displayId
    ? `/problem/${submission.problem.displayId}`
    : `/problem/by-id/${submission.problem.id}`;

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
      <Link href={problemUrl}>
        {problemIdString}. {submission.problemTitle}
      </Link>
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
      trigger={
        <div>
          <Icon name="file" />
          {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
            <>
              {_(`code_language.${submission.codeLanguage}.name`)}
              &nbsp;/&nbsp;
            </>
          )}
          <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
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
          <div>
            {columnMemory}
            {columnSubmitTime}
          </div>
        </>
      ) : (
        <>
          <div>
            {columnTime}
            {columnMemory}
            {columnAnswer}
            {columnSubmitTime}
          </div>
        </>
      )}
    </div>
  );
};

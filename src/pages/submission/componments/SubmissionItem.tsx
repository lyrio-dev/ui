import React from "react";
import { Link } from "react-navi";
import { Table } from "semantic-ui-react";

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
  page: "submission" | "submissions";
}

export const SubmissionItem: React.FC<SubmissionItemProps> = props => {
  const _ = useIntlMessage();

  const submission = props.submission;
  const submissionLink = `/submission/${submission.id}`;
  const timeString = formatDateTime(submission.submitTime);

  const problemIdString = submission.problem.displayId
    ? "#" + submission.problem.displayId
    : "P" + submission.problem.id;
  const problemUrl = submission.problem.displayId
    ? `/problem/${submission.problem.displayId}`
    : `/problem/by-id/${submission.problem.id}`;

  return (
    <Table.Row id={submission.id}>
      <Table.Cell className={style.columnStatus} textAlign="left">
        <Link href={props.page === "submissions" && submissionLink}>
          <StatusText status={submission.status} />
        </Link>
      </Table.Cell>
      <Table.Cell className={style.columnScore}>
        <Link href={props.page === "submissions" && submissionLink}>
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
      <Table.Cell className={style.columnMemory} title={submission.memoryUsed + " B"}>
        {formatFileSize(submission.memoryUsed, 2)}
      </Table.Cell>
      <Table.Cell className={style.columnAnswer}>
        {Object.values(CodeLanguage).includes(submission.codeLanguage as any) && (
          <>
            <Link href={props.page === "submissions" && submissionLink}>
              {_(`code_language.${submission.codeLanguage}.name`)}
            </Link>
            &nbsp;/&nbsp;
          </>
        )}
        <span title={submission.answerSize + " B"}>{formatFileSize(submission.answerSize, 1)}</span>
      </Table.Cell>
      <Table.Cell className={style.columnSubmitTime} title={timeString[1]}>
        {timeString[0]}
      </Table.Cell>
    </Table.Row>
  );
};

export const SubmissionHeader: React.FC<{}> = () => {
  const _ = useIntlMessage();

  return (
    <Table.Row>
      <Table.HeaderCell className={style.columnStatus} textAlign="left">
        {_("submission_item.columns.status")}
      </Table.HeaderCell>
      <Table.HeaderCell className={style.columnScore}>{_("submission_item.columns.score")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnProblemAndSubmitter} textAlign="left">
        <div className={style.problem}>{_("submission_item.columns.problem")}</div>
        <div className={style.submitter}>{_("submission_item.columns.submitter")}</div>
      </Table.HeaderCell>
      <Table.HeaderCell className={style.columnTime}>{_("submission_item.columns.time")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnMemory}>{_("submission_item.columns.memory")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnAnswer}>{_("submission_item.columns.answer")}</Table.HeaderCell>
      <Table.HeaderCell className={style.columnSubmitTime}>{_("submission_item.columns.submit_time")}</Table.HeaderCell>
    </Table.Row>
  );
};

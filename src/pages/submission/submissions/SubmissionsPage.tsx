import React, { useEffect, useState, useRef } from "react";
import { Table, Form, Icon, Button, Segment, Header } from "semantic-ui-react";
import { useNavigation } from "react-navi";
import { observer } from "mobx-react";
import { v4 as uuid } from "uuid";
import { patch } from "jsondiffpatch";

import style from "./SubmissionsPage.module.less";

import { SubmissionApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage, useFieldCheckSimple, useSocket } from "@/utils/hooks";
import toast from "@/utils/toast";
import { CodeLanguage, compileAndRunOptions } from "@/interfaces/CodeLanguage";
import { SubmissionStatus } from "@/interfaces/SubmissionStatus";
import { isValidUsername } from "@/utils/validators";
import StatusText from "@/components/StatusText";
import {
  SubmissionItem,
  SubmissionItemMobile,
  SubmissionHeader,
  SubmissionHeaderMobile
} from "../componments/SubmissionItem";
import SimplePagination from "@/components/SimplePagination";
import { defineRoute, RouteError } from "@/AppRouter";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";
import { SubmissionProgressMessageMetaOnly, SubmissionProgressType } from "../common";

const SUBMISSIONS_PER_PAGE = 10;

interface SubmissionsQuery {
  problemId: number;
  problemDisplayId: number;
  submitter: string;
  codeLanguage: CodeLanguage;
  status: SubmissionStatus;
  minId: number;
  maxId: number;
}

function normalizeQuery(query: Record<string, string>): SubmissionsQuery {
  const result: SubmissionsQuery = {
    problemId: Number(query.problemId) ? Number(query.problemId) : null,
    problemDisplayId:
      Number(query.problemDisplayId) && !Number(query.problemId) ? Number(query.problemDisplayId) : null,
    submitter: isValidUsername(query.submitter) ? query.submitter : null,
    codeLanguage: Object.values(CodeLanguage).includes(query.codeLanguage as CodeLanguage)
      ? (query.codeLanguage as CodeLanguage)
      : null,
    status: query.status in SubmissionStatus ? (query.status as SubmissionStatus) : null,
    minId: Number.isSafeInteger(Number(query.minId)) ? Number(query.minId) : null,
    maxId: Number.isSafeInteger(Number(query.maxId)) ? Number(query.maxId) : null
  };
  return Object.fromEntries(Object.entries(result).filter(([key, value]) => value != null)) as SubmissionsQuery;
}

async function fetchData(query: SubmissionsQuery) {
  const { requestError, response } = await SubmissionApi.querySubmission({
    ...query,
    locale: appState.locale,
    takeCount: SUBMISSIONS_PER_PAGE
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });

  return response;
}

interface SubmissionsPageProps {
  query: SubmissionsQuery;
  queryResult: ApiTypes.QuerySubmissionResponseDto;
}

let SubmissionsPage: React.FC<SubmissionsPageProps> = props => {
  const _ = useIntlMessage("submissions");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(_(".title"), "submissions");
  }, [appState.locale]);

  useEffect(() => {
    if (props.queryResult.error) toast.error(_(`.query_error.${props.queryResult.error}`));
  }, []);

  const [queryProblemId, setQueryProblemId] = useState(
    props.query.problemDisplayId
      ? props.query.problemDisplayId.toString()
      : props.query.problemId
      ? "P" + props.query.problemId
      : ""
  );
  const [checkQueryProblemId, queryProblemIdError] = useFieldCheckSimple(queryProblemId, value => {
    if (value.toUpperCase().startsWith("P") && Number.isSafeInteger(Number(value.substr(1)))) return true;
    if (Number.isSafeInteger(Number(value))) return true;
    return false;
  });

  const [querySubmitter, setQuerySubmitter] = useState(props.query.submitter);
  const [checkQuerySubmitter, querySubmitterError] = useFieldCheckSimple(
    querySubmitter,
    value => !value || isValidUsername(value)
  );

  const [queryCodeLanguage, setQueryCodeLanguage] = useState(props.query.codeLanguage);
  const [queryStatus, setQueryStatus] = useState(props.query.status);

  function onFilter(filterMySubmissions: boolean) {
    if (!checkQueryProblemId()) return toast.error(_(".query_error.INVALID_PROBLEM_ID"));
    else if (!filterMySubmissions && !checkQuerySubmitter()) return toast.error(_(".query_error.INVALID_USERNAME"));

    const query: Partial<SubmissionsQuery> = {};
    if (queryProblemId && queryProblemId.toUpperCase().startsWith("P"))
      query.problemId = Number(queryProblemId.substr(1));
    if (queryProblemId && !queryProblemId.toUpperCase().startsWith("P"))
      query.problemDisplayId = Number(queryProblemId);
    if (filterMySubmissions) query.submitter = appState.currentUser.username;
    else if (querySubmitter) query.submitter = querySubmitter;
    if (queryCodeLanguage) query.codeLanguage = queryCodeLanguage;
    if (queryStatus) query.status = queryStatus;

    navigation.navigate({
      query: Object.fromEntries(Object.entries(query).map(([key, value]) => [key, value.toString()]))
    });
  }

  const stateSubmissions = useState(props.queryResult.submissions ? props.queryResult.submissions : []);
  const [submissions, setSubmissions] = stateSubmissions;

  const refStateSubmissions = useRef<typeof stateSubmissions>();
  refStateSubmissions.current = stateSubmissions;

  // Subscribe to submission progress with the key
  const subscriptionKey = props.queryResult.progressSubscriptionKey;
  // Save the messages to a map, since we receive message delta each time
  const messagesMapRef = useRef<Map<number, SubmissionProgressMessageMetaOnly>>();
  useSocket(
    "submission-progress",
    {
      subscriptionKey: subscriptionKey
    },
    socket => {
      socket.on("message", (submissionId: number, messageDelta: any) => {
        const messageMap = messagesMapRef.current;
        let message = messageMap.get(submissionId);
        message = patch(message, messageDelta);
        messageMap.set(submissionId, message);

        const [submissions, setSubmissions] = refStateSubmissions.current;
        const newSubmissions = [...submissions];
        for (const i in newSubmissions) {
          if (submissionId === newSubmissions[i].id) {
            if (!message.progressMeta.resultMeta) {
              // Not finished
              newSubmissions[i] = {
                ...newSubmissions[i],
                progressType: message.progressMeta.progressType
              };
            } else {
              // Finished
              delete newSubmissions[i].progressType;
              newSubmissions[i] = {
                ...newSubmissions[i],
                ...message.progressMeta.resultMeta
              };
            }

            break;
          }
        }
        setSubmissions(newSubmissions);
      });
    },
    () => {
      // Server maintains the "previous" messages for each connection,
      // so clear the local "previous" messages after reconnection
      console.log("connected");
      messagesMapRef.current = new Map();
    },
    !!subscriptionKey
  );

  const hasPrevPage = props.queryResult.hasLargerId;
  const hasNextPage = props.queryResult.hasSmallerId;

  function onPageChange(direction: -1 | 1) {
    const query = Object.assign({}, props.query);
    if (direction === -1) {
      query.minId = submissions[0].id + 1;
      delete query.maxId;
    } else {
      query.maxId = submissions[submissions.length - 1].id - 1;
      delete query.minId;
    }
    navigation.navigate({
      query: Object.fromEntries(Object.entries(query).map(([key, value]) => [key, value.toString()]))
    });
  }

  const isWideScreen = useScreenWidthWithin(1024, Infinity);
  const isMobile = useScreenWidthWithin(0, 768);

  return (
    <>
      <Form className={style.queryForm}>
        <Form.Group inline unstackable>
          <Form.Input
            className={style.queryInputProblemId}
            icon="hashtag"
            iconPosition="left"
            placeholder={_(".query.problem_id")}
            value={queryProblemId}
            onChange={(e, { value }) => setQueryProblemId(value)}
            onBlur={checkQueryProblemId}
            error={queryProblemIdError}
          />
          <Form.Input
            className={style.queryInputSubmitter}
            icon="user"
            iconPosition="left"
            placeholder={_(".query.submitter")}
            value={querySubmitter}
            onChange={(e, { value }) => setQuerySubmitter(value)}
            onBlur={checkQuerySubmitter}
            error={querySubmitterError}
          />
          <Form.Select
            className={
              style.queryInputCodeLanguage + " " + style.select + (!queryCodeLanguage ? " " + style.selectedAll : "")
            }
            value={queryCodeLanguage || "ALL"}
            onChange={(e, { value }) => setQueryCodeLanguage(value === "ALL" ? null : (value as CodeLanguage))}
            options={[
              {
                key: "",
                value: "ALL",
                text: (
                  <>
                    <Icon name="code" />
                    <span className={style.notInMenu}>{_(".query.code_language")}</span>
                    <span className={style.inMenu}>{_(".query.code_language_all")}</span>
                  </>
                )
              },
              ...Object.keys(compileAndRunOptions).map(language => ({
                key: language,
                value: language,
                text: (
                  <>
                    <Icon name="code" />
                    {_(`code_language.${language}.name`)}
                  </>
                )
              }))
            ]}
          />
          <Form.Select
            className={style.queryInputStatus + " " + style.select + (!queryStatus ? " " + style.selectedAll : "")}
            value={queryStatus || "ALL"}
            onChange={(e, { value }) => setQueryStatus(value === "ALL" ? null : (value as SubmissionStatus))}
            options={[
              {
                key: "",
                value: "ALL",
                text: (
                  <>
                    <Icon name="question" />
                    <span className={style.notInMenu}>{_(".query.status")}</span>
                    <span className={style.inMenu}>{_(".query.status_all")}</span>
                  </>
                )
              },
              ...Object.values(SubmissionStatus).map(status => ({
                key: status,
                value: status,
                text: <StatusText status={status} />
              }))
            ]}
          />
          <Button
            className={style.queryButton + (isWideScreen ? " labeled icon" : "")}
            icon="search"
            content={isWideScreen ? _(".query.filter") : null}
            onClick={() => onFilter(false)}
          />
          {appState.currentUser && (
            <Button
              className={(isWideScreen ? "labeled icon " : "") + style.mySubmissions}
              primary
              icon="user"
              content={isWideScreen ? _(".query.my_submissions") : null}
              onClick={() => onFilter(true)}
            />
          )}
        </Form.Group>
      </Form>
      {submissions.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            {Object.values(props.query).some(x => x) ? (
              <>
                <Icon name="search" />
                {_(".empty.message_filtered")}
              </>
            ) : (
              <>
                <Icon name="file" />
                {_(".empty.message_not_filtered")}
              </>
            )}
          </Header>
          <Segment.Inline>
            <Button primary onClick={() => navigation.goBack()}>
              {_(".empty.goback")}
            </Button>
          </Segment.Inline>
        </Segment>
      ) : (
        <>
          <Table textAlign="center" basic="very" className={style.table} unstackable fixed>
            {isMobile ? (
              <Table.Header>
                <SubmissionHeaderMobile />
              </Table.Header>
            ) : (
              <Table.Header>
                <SubmissionHeader page="submissions" />
              </Table.Header>
            )}
            <Table.Body>
              {submissions.map(submission => {
                let status = null;
                if (submission.status === "Pending") {
                  switch (submission.progressType) {
                    case SubmissionProgressType.Preparing:
                      status = "Preparing";
                      break;
                    case SubmissionProgressType.Compiling:
                      status = "Compiling";
                      break;
                    case SubmissionProgressType.Running:
                      status = "Running";
                      break;
                    default:
                      status = "Waiting";
                  }
                }
                return isMobile ? (
                  <SubmissionItemMobile
                    key={submission.id}
                    submission={{
                      ...submission,
                      status: status || submission.status
                    }}
                  />
                ) : (
                  <SubmissionItem
                    key={submission.id}
                    submission={{
                      ...submission,
                      status: status || submission.status
                    }}
                    page="submissions"
                  />
                );
              })}
            </Table.Body>
          </Table>
          <SimplePagination hasPrevPage={hasPrevPage} hasNextPage={hasNextPage} onPageChange={onPageChange} />
        </>
      )}
    </>
  );
};

SubmissionsPage = observer(SubmissionsPage);

export default defineRoute(async request => {
  const query = normalizeQuery(request.query);
  const queryResult = await fetchData(query);

  return <SubmissionsPage key={uuid()} query={query} queryResult={queryResult} />;
});

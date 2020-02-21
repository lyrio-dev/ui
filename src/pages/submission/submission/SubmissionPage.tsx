import React, { useState, useRef, useEffect } from "react";
import { Segment, Table, Icon, Accordion, Grid, SemanticWIDTHS, Header, List } from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import uuid from "uuid";
import AnsiToHtmlConverter from "ansi-to-html";
import highlight from "highlight.js";
import { patch } from "jsondiffpatch";

import "highlight.js/styles/tomorrow.css";
import style from "./SubmissionPage.module.less";

import { appState } from "@/appState";
import { SubmissionApi, ProblemApi } from "@/api-generated";
import toast from "@/utils/toast";
import { useIntlMessage, useSocket } from "@/utils/hooks";
import { SubmissionHeader, SubmissionItem, SubmissionItemExtraRows } from "../componments/SubmissionItem";
import { codeLanguageHighlightName } from "@/interfaces/CodeLanguage";
import StatusText from "@/components/StatusText";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import { SubmissionStatus } from "@/interfaces/SubmissionStatus";

async function fetchData(submissionId: number) {
  const { requestError, response } = await SubmissionApi.getSubmissionDetail({
    submissionId: submissionId.toString(),
    locale: appState.locale
  });
  if (requestError) toast.error(requestError);
  else if (response.error) toast.error(`submission.error.${response.error}`);

  type RemoveOptional<T> = {
    [K in keyof T]-?: T[K];
  };
  return response as RemoveOptional<ApiTypes.GetSubmissionDetailResponseDto>;
}

interface CodeBoxProps {
  className?: string;
  title?: React.ReactNode;
  content?: React.ReactNode;
  highlightLanguage?: string;
  html?: string;
  download?: () => void;
}

const CodeBox = React.forwardRef<HTMLPreElement, CodeBoxProps>((props, ref) => {
  const html =
    props.html ||
    (props.highlightLanguage &&
      typeof props.content === "string" &&
      highlight.highlight(props.highlightLanguage, props.content).value);
  const content = !props.html && !props.highlightLanguage ? props.content : undefined;

  return (
    (html || content) && (
      <div className={style.codeBox + (props.className ? " " + props.className : "")}>
        {props.title && <p>{typeof props.title === "string" ? <strong>{props.title}</strong> : props.title}</p>}
        <Segment className={style.codeBoxSegment}>
          {props.children}
          <pre ref={ref} className={style.codeBoxContent} dangerouslySetInnerHTML={html && { __html: html }}>
            {content}
          </pre>
        </Segment>
      </div>
    )
  );
});

interface SubmissionProgressMessage {
  progressMeta?: SubmissionProgressType;
  progressDetail?: SubmissionProgress<unknown>;
  resultMeta?: Partial<ApiTypes.SubmissionMetaDto>;
  resultDetail?: SubmissionResult<unknown>;
}

interface SubmissionProgress<TestcaseResult> {
  progressType: SubmissionProgressType;

  // Only valid when finished
  status?: SubmissionStatus;
  score?: number;

  compile?: {
    success: boolean;
    message: string;
  };

  systemMessage?: string;

  // testcaseHash = hash(IF, OF, TL, ML) for traditional
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: {
      // If !waiting && !running && !testcaseHash, it's "Skipped"
      waiting?: boolean;
      running?: boolean;
      testcaseHash?: string;
    }[];
  }[];
}

interface SubmissionResult<TestcaseResult> {
  compile?: {
    success: boolean;
    message: string;
  };
  // For SystemError and ConfigurationError
  systemMessage?: string;
  // testcaseHash = hash(IF, OF, TL, ML) for traditional
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: string[]; // The hash of testcase (if null, it's "Skipped")
  }[];
}

interface SubmissionTestcaseResultTraditional {
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
  graderMessage?: string;
  systemMessage?: string;
}

export enum SubmissionProgressType {
  Preparing,
  Compiling,
  Running,
  Finished
}

export interface SubmissionFullInfo<TestcaseResult> {
  progressType?: SubmissionProgressType;

  // e.g. "Running"
  status: string;
  // e.g. "Running 3/10"
  statusText?: string;
  score: number;
  timeUsed?: number;
  memoryUsed?: number;

  compile?: {
    success: boolean;
    message: string;
  };

  systemMessage?: string;

  // testcaseHash = hash(IF, OF, TL, ML) for traditional
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: {
      // If !waiting && !running && !testcaseHash, it's "Skipped"
      waiting?: boolean;
      running?: boolean;
      testcaseHash?: string;
    }[];
  }[];
}

function parseResult(
  meta: ApiTypes.SubmissionMetaDto,
  result: SubmissionResult<SubmissionTestcaseResultTraditional>
): SubmissionFullInfo<SubmissionTestcaseResultTraditional> {
  return {
    ...result,
    progressType: SubmissionProgressType.Finished,
    status: meta.status,
    score: meta.score,
    timeUsed: meta.timeUsed,
    memoryUsed: meta.memoryUsed,
    subtasks:
      result.subtasks &&
      result.subtasks.map(subtask => ({
        ...subtask,
        testcases: subtask.testcases.map(testcase =>
          testcase
            ? {
                testcaseHash: testcase
              }
            : {
                // Skipped
                waiting: false,
                running: false
              }
        )
      }))
  };
}

function parseProgress(
  progress: SubmissionProgress<SubmissionTestcaseResultTraditional>
): SubmissionFullInfo<SubmissionTestcaseResultTraditional> {
  if (!progress) {
    return {
      progressType: null,
      status: "Waiting",
      score: 0,
      timeUsed: 0,
      memoryUsed: 0
    };
  }

  let status = "";
  switch (progress.progressType) {
    case SubmissionProgressType.Preparing:
      status = "Preparing";
      break;
    case SubmissionProgressType.Compiling:
      status = "Compiling";
      break;
    case SubmissionProgressType.Running:
      status = "Running";
      break;
  }

  let statusText = status,
    score = 0;
  if (progress.progressType === SubmissionProgressType.Running) {
    let totalCount = 0,
      finishedCount = 0;
    for (const subtask of progress.subtasks) {
      score += subtask.score;
      for (const testcase of subtask.testcases) {
        totalCount++;
        if (!testcase.running && !testcase.waiting) finishedCount++;
      }
    }
    statusText += ` ${finishedCount}/${totalCount}`;
  }

  let timeUsed = 0,
    memoryUsed = 0;
  if (Array.isArray(progress.subtasks)) {
    for (const subtask of progress.subtasks) {
      for (const { testcaseHash } of subtask.testcases) {
        if (!testcaseHash) continue;
        timeUsed += progress.testcaseResult[testcaseHash].time;
        memoryUsed = Math.max(memoryUsed, progress.testcaseResult[testcaseHash].memory);
      }
    }
  }

  return {
    ...progress,
    status,
    statusText,
    score,
    timeUsed,
    memoryUsed
  };
}

interface SubmissionContentTraditional {
  language: string;
  code: string;
  languageOptions: Record<string, string>;
}

interface SubmissionPageProps {
  meta: ApiTypes.SubmissionMetaDto;
  content: unknown;
  result: SubmissionResult<unknown>;
  progress?: SubmissionProgress<unknown>;
  progressSubscriptionKey?: string;
}

// Convert the compiler's message to HTML
function ansiToHtml(ansi: string) {
  const converter = new AnsiToHtmlConverter();
  return converter.toHtml(ansi);
}

let SubmissionPage: React.FC<SubmissionPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = `${_("submission.title")} #${props.meta.id}`;
  }, [appState.locale]);

  const content = props.content as SubmissionContentTraditional;

  // The meta only provides fields not changing with progress
  // score, status, time, memory are in the full info
  // score and status are in this meta, but we still use them in full info
  const meta = props.meta;
  const stateFullInfo = useState(
    props.meta.status === "Pending"
      ? parseProgress(props.progress as SubmissionProgress<SubmissionTestcaseResultTraditional>)
      : parseResult(meta, props.result as SubmissionResult<SubmissionTestcaseResultTraditional>)
  );
  const [fullInfo, setFullInfo] = stateFullInfo;

  const refStateFullInfo = useRef<typeof stateFullInfo>();
  refStateFullInfo.current = stateFullInfo;

  // Subscribe to submission progress with the key
  const subscriptionKey = props.progressSubscriptionKey;
  // Save the previous message, since we receive message delta each time
  const messageRef = useRef<SubmissionProgressMessage>();
  useSocket(
    "submission-progress",
    {
      subscriptionKey: subscriptionKey
    },
    socket => {
      socket.on("message", (submissionId: number, messageDelta: any) => {
        messageRef.current = patch(messageRef.current, messageDelta);
        const message = messageRef.current;

        const [fullInfo, setFullInfo] = refStateFullInfo.current;

        if (message.resultDetail) {
          setFullInfo(
            parseResult(
              {
                ...meta,
                ...message.resultMeta
              },
              message.resultDetail as SubmissionResult<SubmissionTestcaseResultTraditional>
            )
          );
        } else {
          setFullInfo(parseProgress(message.progressDetail as SubmissionProgress<SubmissionTestcaseResultTraditional>));
        }
      });
    },
    () => {
      // Server maintains the "previous" messages for each connection,
      // so clear the local "previous" messages after reconnection
      console.log("connected");
      messageRef.current = undefined;
    },
    !!subscriptionKey
  );

  // displayMeta contains fields parsed from the progress
  const displayMeta: ApiTypes.SubmissionMetaDto = {
    ...meta,
    timeUsed: fullInfo.timeUsed,
    memoryUsed: fullInfo.memoryUsed,
    status: fullInfo.status as any,
    score: fullInfo.score
  };

  const refCodeContainer = useRef<HTMLPreElement>(null);

  // Ctrl-A to select all code
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (refCodeContainer.current && (event.ctrlKey || event.metaKey) && event.key === "a") {
        var sel = window.getSelection();
        var rg = document.createRange();
        rg.selectNodeContents(refCodeContainer.current);
        sel.removeAllRanges();
        sel.addRange(rg);
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  async function onDownload(filename: string) {
    const { requestError, response } = await ProblemApi.downloadProblemFiles({
      problemId: meta.problem.id,
      type: "TestData",
      filenameList: [filename]
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`submission.error.${response.error}`));
    else downloadFile(response.downloadInfo[0].downloadUrl, filename);
  }

  const isWideScreen = appState.isScreenWidthIn(1024, Infinity);
  const isMobile = appState.isScreenWidthIn(0, 768);
  const isNarrowMobile = appState.isScreenWidthIn(0, 425);

  const subtasks = (fullInfo && fullInfo.subtasks) || [];
  const subtaskDisplayInfo: {
    status: string;
    statusText?: string;
    expandable: boolean;
  }[] = new Array(subtasks.length);
  subtasks.forEach((subtask, i) => {
    let finishedCount = 0,
      runningCount = 0,
      firstNonAcceptedStatus = "";
    for (const testcase of subtask.testcases) {
      if (!testcase.waiting && !testcase.running) {
        finishedCount++;
        if (testcase.testcaseHash) {
          const testcaseResult = fullInfo.testcaseResult[testcase.testcaseHash];
          if (!firstNonAcceptedStatus && testcaseResult.status !== "Accepted")
            firstNonAcceptedStatus = testcaseResult.status;
        } else {
          // Skipped
          if (!firstNonAcceptedStatus) firstNonAcceptedStatus = "Skipped";
        }
      } else if (testcase.running) runningCount++;
    }

    if (finishedCount === subtask.testcases.length) {
      subtaskDisplayInfo[i] = {
        status: firstNonAcceptedStatus || "Accepted",
        expandable: firstNonAcceptedStatus !== "Skipped"
      };
    } else {
      if (finishedCount === 0 && runningCount === 0)
        subtaskDisplayInfo[i] = {
          status: "Waiting",
          expandable: false
        };
      else
        subtaskDisplayInfo[i] = {
          status: "Running",
          expandable: true
        };
      subtaskDisplayInfo[i].statusText =
        subtaskDisplayInfo[i].status + " " + finishedCount + "/" + subtask.testcases.length;
    }
  });

  function round(x?: number) {
    x = x || 0;
    const s = x.toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  }

  const subtaskList = subtasks.map((subtask, i) => ({
    key: i,
    // If a subtask is unexpandable, make it unable to be "active"
    [!subtaskDisplayInfo[i].expandable ? "active" : ""]: false,
    title: (() => {
      const columnTitle = (width: SemanticWIDTHS) => (
        <Grid.Column width={width}>
          <Icon name="dropdown" />
          {_("submission.subtask.title")} #{i + 1}
        </Grid.Column>
      );

      const columnStatus = (width: SemanticWIDTHS) => (
        <Grid.Column width={width}>
          <StatusText status={subtaskDisplayInfo[i].status} statusText={subtaskDisplayInfo[i].statusText} />
        </Grid.Column>
      );

      const columnScore = (width: SemanticWIDTHS) => (
        <Grid.Column width={width}>
          <Icon className={style.accordionTitleIcon} name="clipboard check" />
          {round(subtask.score)}/{round(subtask.fullScore)} pts
        </Grid.Column>
      );

      if (isWideScreen) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(3)}
              {columnStatus(4)}
              {columnScore(3)}
            </Grid>
          </Accordion.Title>
        );
      } else if (!isMobile) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(4)}
              {columnStatus(5)}
              {columnScore(4)}
            </Grid>
          </Accordion.Title>
        );
      } else if (!isNarrowMobile) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(4)}
              {columnStatus(7)}
              {columnScore(5)}
            </Grid>
          </Accordion.Title>
        );
      } else {
        return (
          <Accordion.Title className={style.accordionTitle + " " + style.accordionTitleTwoRows}>
            <Grid>
              <Grid.Row className={style.accordionTitleFirstRow}>
                {columnTitle(6)}
                {columnStatus(10)}
              </Grid.Row>
              <Grid.Row className={style.accordionTitleSecondRow}>{columnScore(5)}</Grid.Row>
            </Grid>
          </Accordion.Title>
        );
      }
    })(),
    content: !subtask.testcases.some(x => x != null) ? null : (
      <Accordion.Content className={style.accordionContent}>
        <Accordion
          className={"styled fluid " + style.subAccordion}
          panels={subtask.testcases.map((testcase, i) => {
            const testcaseResult = testcase.testcaseHash && fullInfo.testcaseResult[testcase.testcaseHash];
            let status: string, expandable: boolean;
            if (testcase.waiting) {
              status = "Waiting";
              expandable = false;
            } else if (testcase.running) {
              status = "Running";
              expandable = false;
            } else if (!testcaseResult) {
              status = "Skipped";
              expandable = false;
            } else {
              status = testcaseResult.status;
              expandable = true;
            }

            return {
              key: i,
              // If a testcase is unexpandable, make it unable to be "active"
              [!expandable ? "active" : ""]: false,
              title: (() => {
                const columnTitle = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnTitle} width={width}>
                    <Icon name="dropdown" />
                    {_("submission.testcase.title")} #{i + 1}
                  </Grid.Column>
                );

                const columnStatus = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnStatus} width={width}>
                    <StatusText status={status} />
                  </Grid.Column>
                );

                const columnScore = (width: SemanticWIDTHS) =>
                  testcaseResult && (
                    <Grid.Column className={style.testcaseColumnScore} width={width}>
                      <Icon className={style.accordionTitleIcon} name="clipboard check" />
                      {round(testcaseResult.score)} pts
                    </Grid.Column>
                  );

                const columnTime = (width: SemanticWIDTHS) =>
                  testcaseResult && (
                    <Grid.Column className={style.testcaseColumnTime} width={width}>
                      <span
                        title={
                          testcaseResult.time == null
                            ? null
                            : Math.round(testcaseResult.time || 0) +
                              " ms / " +
                              testcaseResult.testcaseInfo.timeLimit +
                              " ms"
                        }
                      >
                        <Icon className={style.accordionTitleIcon} name="clock" />
                        {Math.round(testcaseResult.time || 0) + " ms"}
                      </span>
                    </Grid.Column>
                  );

                const columnMemory = (width: SemanticWIDTHS) =>
                  testcaseResult && (
                    <Grid.Column className={style.testcaseColumnMemory} width={width}>
                      <span
                        title={
                          testcaseResult.memory == null
                            ? null
                            : (testcaseResult.memory || 0) +
                              " K / " +
                              testcaseResult.testcaseInfo.memoryLimit * 1024 +
                              " K"
                        }
                      >
                        <Icon className={style.accordionTitleIcon} name="microchip" />
                        {formatFileSize((testcaseResult.memory || 0) * 1024)}
                      </span>
                    </Grid.Column>
                  );

                return isMobile ? (
                  <Accordion.Title className={style.accordionTitle + " " + style.accordionTitleTwoRows}>
                    <Grid>
                      <Grid.Row className={style.accordionTitleFirstRow}>
                        {columnTitle(6)}
                        {columnStatus(10)}
                      </Grid.Row>
                      {testcase && (
                        <Grid.Row className={style.accordionTitleSecondRow}>
                          {columnScore(6)}
                          {columnTime(5)}
                          {columnMemory(5)}
                        </Grid.Row>
                      )}
                    </Grid>
                  </Accordion.Title>
                ) : (
                  <Accordion.Title className={style.accordionTitle}>
                    <Grid>
                      {columnTitle(3)}
                      {columnStatus(4)}
                      {testcase && (
                        <>
                          {columnScore(3)}
                          {columnTime(3)}
                          {columnMemory(3)}
                        </>
                      )}
                    </Grid>
                  </Accordion.Title>
                );
              })(),
              content: !testcaseResult ? null : (
                <Accordion.Content className={style.accordionContent}>
                  {testcaseResult.input && (
                    <CodeBox
                      title={
                        <>
                          <strong>{_("submission.testcase.input")}</strong>
                          <span
                            className={"monospace " + style.fileNameWrapper}
                            onClick={() => onDownload(testcaseResult.testcaseInfo.inputFilename)}
                          >
                            <span className={style.fileName}>{testcaseResult.testcaseInfo.inputFilename}</span>
                            <Icon name="download" />
                          </span>
                        </>
                      }
                      content={testcaseResult.input}
                    />
                  )}
                  {testcaseResult.output && (
                    <CodeBox
                      title={
                        <>
                          <strong>{_("submission.testcase.output")}</strong>
                          <span
                            className={"monospace " + style.fileNameWrapper}
                            onClick={() => onDownload(testcaseResult.testcaseInfo.outputFilename)}
                          >
                            <span className={style.fileName}>{testcaseResult.testcaseInfo.outputFilename}</span>
                            <Icon name="download" />
                          </span>
                        </>
                      }
                      content={testcaseResult.output}
                      download={() => onDownload(testcaseResult.testcaseInfo.outputFilename)}
                    />
                  )}
                  <CodeBox title={_("submission.testcase.user_output")} content={testcaseResult.userOutput} />
                  <CodeBox title={_("submission.testcase.user_error")} content={testcaseResult.userError} />
                  <CodeBox title={_("submission.testcase.grader_message")} content={testcaseResult.graderMessage} />
                  <CodeBox title={_("submission.testcase.system_message")} content={testcaseResult.systemMessage} />
                </Accordion.Content>
              )
            };
          })}
        />
      </Accordion.Content>
    )
  }));

  const answerInfo = (
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

  return (
    <>
      {!isMobile && (
        <Table textAlign="center" basic="very" unstackable fixed={isWideScreen} compact={isWideScreen ? false : "very"}>
          <Table.Header>
            <SubmissionHeader page="submission" />
          </Table.Header>
          <Table.Body>
            <SubmissionItem
              submission={displayMeta}
              statusText={fullInfo.statusText}
              answerInfo={answerInfo}
              page="submission"
            />
          </Table.Body>
        </Table>
      )}
      {!isWideScreen && (
        <SubmissionItemExtraRows submission={displayMeta} answerInfo={answerInfo} isMobile={isMobile} />
      )}
      <CodeBox
        className={style.main}
        content={content.code}
        highlightLanguage={codeLanguageHighlightName[content.language]}
        ref={refCodeContainer}
      />
      {fullInfo && fullInfo.compile && fullInfo.compile.message && (
        <CodeBox
          className={style.main}
          title={_("submission.compilation_message")}
          html={ansiToHtml(fullInfo.compile.message)}
        />
      )}
      {fullInfo && fullInfo.systemMessage && (
        <CodeBox className={style.main} title={_("submission.system_message")} content={fullInfo.systemMessage} />
      )}
      {fullInfo &&
        fullInfo.subtasks &&
        fullInfo.subtasks &&
        (subtaskList.length === 1 ? (
          subtaskList[0].content
        ) : (
          <Accordion className={"styled fluid " + style.accordion} panels={subtaskList} />
        ))}
    </>
  );
};

SubmissionPage = observer(SubmissionPage);

export default route({
  async getView(request) {
    const queryResult = await fetchData(parseInt(request.params.id) || 0);
    if (queryResult === null) {
      // TODO: Display an error page
      return null;
    }

    return <SubmissionPage key={uuid()} {...(queryResult as any)} />;
  }
});

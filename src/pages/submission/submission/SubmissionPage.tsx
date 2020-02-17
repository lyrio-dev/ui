import React, { useState, useRef, useEffect } from "react";
import { Segment, Table, Icon, Accordion, Grid } from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import uuid from "uuid";
import AnsiToHtmlConverter from "ansi-to-html";
import highlight from "highlight.js";

import "highlight.js/styles/tomorrow.css";
import style from "./SubmissionPage.module.less";

import { appState } from "@/appState";
import { SubmissionApi, ProblemApi } from "@/api-generated";
import toast from "@/utils/toast";
import { useIntlMessage } from "@/utils/hooks";
import { SubmissionHeader, SubmissionItem, SubmissionItemExtraRows } from "../componments/SubmissionItem";
import { codeLanguageHighlightName } from "@/interfaces/CodeLanguage";
import StatusText from "@/components/StatusText";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import { SemanticWIDTHS } from "semantic-ui-react/dist/commonjs/generic";

type RemoveOptional<T> = {
  [K in keyof T]-?: T[K];
};

async function fetchData(submissionId: number) {
  const { requestError, response } = await SubmissionApi.getSubmissionDetail({
    submissionId: submissionId.toString(),
    locale: appState.locale
  });
  if (requestError) toast.error(requestError);
  else if (response.error) toast.error(`submission.error.${response.error}`);
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

function getTimeAndMemoryUsed(
  submissionResult: SubmissionResult<SubmissionTestcaseResultTraditional>
): { timeUsed: number; memoryUsed: number } {
  const result = {
    timeUsed: 0,
    memoryUsed: 0
  };

  if (submissionResult && Array.isArray(submissionResult.subtasks)) {
    for (const subtask of submissionResult.subtasks) {
      for (const testcaseUuid of subtask.testcases) {
        if (!testcaseUuid) continue;
        result.timeUsed += submissionResult.testcaseResult[testcaseUuid].time;
        result.memoryUsed = Math.max(result.memoryUsed, submissionResult.testcaseResult[testcaseUuid].memory);
      }
    }
  }

  return result;
}

interface SubmissionContentTraditional {
  language: string;
  code: string;
  languageOptions: unknown;
}

interface SubmissionPageProps {
  partialMeta: Omit<ApiTypes.SubmissionMetaDto, "timeUsed" | "memoryUsed">;
  content: unknown;
  result: SubmissionResult<unknown>;
}

// Convert the compiler's message to HTML
function ansiToHtml(ansi: string) {
  const converter = new AnsiToHtmlConverter();
  return converter.toHtml(ansi);
}

let SubmissionPage: React.FC<SubmissionPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = `${_("submission.title")} #${props.partialMeta.id}`;
  }, [appState.locale]);

  const content = props.content as SubmissionContentTraditional;
  const result = props.result as SubmissionResult<SubmissionTestcaseResultTraditional>;
  const [meta, setMeta] = useState<ApiTypes.SubmissionMetaDto>({
    ...props.partialMeta,
    ...getTimeAndMemoryUsed(result)
  });

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

  const subtasks = (result && result.subtasks) || [];
  const subtaskStatus: string[] = new Array(subtasks.length);
  subtasks.forEach((subtask, i) => {
    let hasNonNullTestcase = false;
    for (const testcaseUuid of subtask.testcases) {
      const testcase = result.testcaseResult[testcaseUuid];
      if (testcase) {
        hasNonNullTestcase = true;
        if (testcase.status != "Accepted") {
          subtaskStatus[i] = testcase.status;
          return;
        }
      }
    }
    subtaskStatus[i] = hasNonNullTestcase ? "Accepted" : "Skipped";
  });

  function round(x: number) {
    const s = x.toFixed(1);
    return s.endsWith(".0") ? s.slice(0, -2) : s;
  }

  const subtaskList = subtasks.map((subtask, i) => ({
    key: i,
    // If a subtask is skipped, make it unable to open
    [subtaskStatus[i] === "Skipped" ? "active" : ""]: false,
    title: (
      <Accordion.Title className={style.accordionTitle}>
        {(() => {
          const columnTitle = (width: SemanticWIDTHS) => (
            <Grid.Column width={width}>
              <Icon name="dropdown" />
              {_("submission.subtask.title")} #{i + 1}
            </Grid.Column>
          );

          const columnStatus = (width: SemanticWIDTHS) => (
            <Grid.Column width={width}>
              <StatusText status={subtaskStatus[i]} />
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
              <Grid>
                {columnTitle(3)}
                {columnStatus(4)}
                {columnScore(3)}
              </Grid>
            );
          } else if (!isMobile) {
            return (
              <Grid>
                {columnTitle(4)}
                {columnStatus(5)}
                {columnScore(4)}
              </Grid>
            );
          } else if (!isNarrowMobile) {
            return (
              <Grid>
                {columnTitle(4)}
                {columnStatus(7)}
                {columnScore(5)}
              </Grid>
            );
          } else {
            return (
              <Grid>
                <Grid.Row className={style.accordionTitleFirstRow}>
                  {columnTitle(6)}
                  {columnStatus(10)}
                </Grid.Row>
                <Grid.Row className={style.accordionTitleSecondRow}>{columnScore(5)}</Grid.Row>
              </Grid>
            );
          }
        })()}
      </Accordion.Title>
    ),
    content: !subtask.testcases.some(x => x != null) ? null : (
      <Accordion.Content className={style.accordionContent}>
        <Accordion.Accordion
          className={"styled fluid " + style.subAccordion}
          panels={subtask.testcases
            .map(testcaseUuid => testcaseUuid && result.testcaseResult[testcaseUuid])
            .map((testcase, i) => ({
              key: i,
              // If a testcase is  skipped, make it unable to open
              [!testcase ? "active" : ""]: false,
              title: (() => {
                const columnTitle = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnTitle} width={width}>
                    <Icon name="dropdown" />
                    {_("submission.testcase.title")} #{i + 1}
                  </Grid.Column>
                );

                const columnStatus = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnStatus} width={width}>
                    <StatusText status={!testcase ? "Skipped" : testcase.status} />
                  </Grid.Column>
                );

                const columnScore = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnScore} width={width}>
                    <Icon className={style.accordionTitleIcon} name="clipboard check" />
                    {round(testcase.score)} pts
                  </Grid.Column>
                );

                const columnTime = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnTime} width={width}>
                    <span
                      title={
                        testcase.time == null
                          ? null
                          : Math.round(testcase.time || 0) + " ms / " + testcase.testcaseInfo.timeLimit + " ms"
                      }
                    >
                      <Icon className={style.accordionTitleIcon} name="clock" />
                      {Math.round(testcase.time || 0) + " ms"}
                    </span>
                  </Grid.Column>
                );

                const columnMemory = (width: SemanticWIDTHS) => (
                  <Grid.Column className={style.testcaseColumnMemory} width={width}>
                    <span
                      title={
                        testcase.memory == null
                          ? null
                          : (testcase.memory || 0) + " K / " + testcase.testcaseInfo.memoryLimit * 1024 + " K"
                      }
                    >
                      <Icon className={style.accordionTitleIcon} name="microchip" />
                      {formatFileSize((testcase.memory || 0) * 1024)}
                    </span>
                  </Grid.Column>
                );

                return (
                  <Accordion.Title className={style.accordionTitle}>
                    <Grid>
                      {isMobile ? (
                        <>
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
                        </>
                      ) : (
                        <>
                          {columnTitle(3)}
                          {columnStatus(4)}
                          {testcase && (
                            <>
                              {columnScore(3)}
                              {columnTime(3)}
                              {columnMemory(3)}
                            </>
                          )}
                        </>
                      )}
                    </Grid>
                  </Accordion.Title>
                );
              })(),
              content: !testcase ? null : (
                <Accordion.Content className={style.accordionContent}>
                  {testcase.input && (
                    <CodeBox
                      title={
                        <>
                          <strong>{_("submission.testcase.input")}</strong>
                          <span
                            className={"monospace " + style.fileNameWrapper}
                            onClick={() => onDownload(testcase.testcaseInfo.inputFilename)}
                          >
                            <span className={style.fileName}>{testcase.testcaseInfo.inputFilename}</span>
                            <Icon name="download" />
                          </span>
                        </>
                      }
                      content={testcase.input}
                    />
                  )}
                  {testcase.output && (
                    <CodeBox
                      title={
                        <>
                          <strong>{_("submission.testcase.output")}</strong>
                          <span
                            className={"monospace " + style.fileNameWrapper}
                            onClick={() => onDownload(testcase.testcaseInfo.outputFilename)}
                          >
                            <span className={style.fileName}>{testcase.testcaseInfo.outputFilename}</span>
                            <Icon name="download" />
                          </span>
                        </>
                      }
                      content={testcase.output}
                      download={() => onDownload(testcase.testcaseInfo.outputFilename)}
                    />
                  )}
                  <CodeBox title={_("submission.testcase.user_output")} content={testcase.userOutput} />
                  <CodeBox title={_("submission.testcase.user_error")} content={testcase.userError} />
                  <CodeBox title={_("submission.testcase.grader_message")} content={testcase.graderMessage} />
                  <CodeBox title={_("submission.testcase.system_message")} content={testcase.systemMessage} />
                </Accordion.Content>
              )
            }))}
        />
      </Accordion.Content>
    )
  }));

  return (
    <>
      {!isMobile && (
        <Table textAlign="center" basic="very" unstackable fixed={isWideScreen} compact={isWideScreen ? false : "very"}>
          <Table.Header>
            <SubmissionHeader page="submission" />
          </Table.Header>
          <Table.Body>
            <SubmissionItem submission={meta} page="submission" />
          </Table.Body>
        </Table>
      )}
      {!isWideScreen && <SubmissionItemExtraRows submission={meta} isMobile={isMobile} />}
      <CodeBox
        className={style.main}
        content={content.code}
        highlightLanguage={codeLanguageHighlightName[content.language]}
        ref={refCodeContainer}
      />
      {result && result.compile && result.compile.message && (
        <CodeBox
          className={style.main}
          title={_("submission.compilation_message")}
          html={ansiToHtml(result.compile.message)}
        />
      )}
      {result && result.systemMessage && (
        <CodeBox className={style.main} title={_("submission.system_message")} content={result.systemMessage} />
      )}
      {result &&
        result.subtasks &&
        result.subtasks &&
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

    return <SubmissionPage key={uuid()} {...queryResult} />;
  }
});

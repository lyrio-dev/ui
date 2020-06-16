import React, { useState, useRef, useEffect, useMemo } from "react";
import { Table, Icon, Accordion, Grid, SemanticWIDTHS, Button, Popup, Ref, Menu } from "semantic-ui-react";
import { observer } from "mobx-react";
import { v4 as uuid } from "uuid";
import { patch } from "jsondiffpatch";
import { useNavigation } from "react-navi";
import { FormattedMessage } from "react-intl";

import style from "./SubmissionPage.module.less";

import { appState } from "@/appState";
import { SubmissionApi, ProblemApi } from "@/api-generated";
import toast from "@/utils/toast";
import { useIntlMessage, useSocket } from "@/utils/hooks";
import { SubmissionHeader, SubmissionItem, SubmissionItemExtraRows } from "../componments/SubmissionItem";
import StatusText from "@/components/StatusText";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import { SubmissionStatus } from "@/interfaces/SubmissionStatus";
import * as CodeFormatter from "@/utils/CodeFormatter";
import * as CodeHighlighter from "@/utils/CodeHighlighter";
import { CodeBox, AnsiCodeBox } from "@/components/CodeBox";
import { defineRoute, RouteError } from "@/AppRouter";
import { TestcaseResultCommon, ProblemTypeSubmissionView, GetAdditionalSectionsCallback } from "./common/interface";
import { ProblemType } from "@/interfaces/ProblemType";

import TraditionalProblemSubmissionView from "./types/TraditionalProblemSubmissionView";
import InteractionProblemSubmissionView from "./types/InteractionProblemSubmissionView";

const problemTypeSubmissionViews: Record<ProblemType, ProblemTypeSubmissionView> = {
  [ProblemType.TRADITIONAL]: TraditionalProblemSubmissionView,
  [ProblemType.INTERACTION]: InteractionProblemSubmissionView
};

async function fetchData(submissionId: number) {
  const { requestError, response } = await SubmissionApi.getSubmissionDetail({
    submissionId: submissionId.toString(),
    locale: appState.locale
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`submission.error.${response.error}`} />);

  type RemoveOptional<T> = {
    [K in keyof T]-?: T[K];
  };
  return response as RemoveOptional<ApiTypes.GetSubmissionDetailResponseDto>;
}

interface SubmissionProgressMessage {
  progressMeta?: SubmissionProgressType;
  progressDetail?: SubmissionProgress;
  resultMeta?: Partial<ApiTypes.SubmissionMetaDto>;
  resultDetail?: SubmissionResult; // null if the result is "Canceled"
}

interface TestcaseProgressReference {
  // If !waiting && !running && !testcaseHash, it's "Skipped"
  waiting?: boolean;
  running?: boolean;
  testcaseHash?: string;
}

interface SubmissionProgress<TestcaseResult extends TestcaseResultCommon = TestcaseResultCommon> {
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
  //                hash(ID, OD, TL, ML) for samples
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  samples?: TestcaseProgressReference[];
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: TestcaseProgressReference[];
  }[];
}

interface SubmissionResult<TestcaseResult extends TestcaseResultCommon = TestcaseResultCommon> {
  compile?: {
    success: boolean;
    message: string;
  };
  // For SystemError and ConfigurationError
  systemMessage?: string;
  // testcaseHash = hash(IF, OF, TL, ML) for traditional
  //                hash(ID, OD, TL, ML) for samples
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  samples?: string[];
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: string[]; // The hash of testcase (if null, it's "Skipped")
  }[];
}

export enum SubmissionProgressType {
  Preparing,
  Compiling,
  Running,
  Finished
}

export interface SubmissionFullInfo<TestcaseResult extends TestcaseResultCommon = TestcaseResultCommon> {
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
  //                hash(ID, OD, TL, ML) for samples
  // ->
  // result
  testcaseResult?: Record<string, TestcaseResult>;
  samples?: TestcaseProgressReference[];
  subtasks?: {
    score: number;
    fullScore: number;
    testcases: TestcaseProgressReference[];
  }[];
}

function parseResult<T extends TestcaseResultCommon>(
  meta: ApiTypes.SubmissionMetaDto,
  result: SubmissionResult<T>
): SubmissionFullInfo<T> {
  const toTestcaseProgressReference = (testcaseHash: string) =>
    testcaseHash
      ? {
          testcaseHash: testcaseHash
        }
      : {
          // Skipped
          waiting: false,
          running: false
        };
  return {
    ...result,
    progressType: SubmissionProgressType.Finished,
    status: meta.status,
    score: meta.score,
    timeUsed: meta.timeUsed,
    memoryUsed: meta.memoryUsed,
    samples: result.samples && result.samples.map(toTestcaseProgressReference),
    subtasks:
      result.subtasks &&
      result.subtasks.map(subtask => ({
        ...subtask,
        testcases: subtask.testcases.map(toTestcaseProgressReference)
      }))
  };
}

function parseProgress<T extends TestcaseResultCommon>(progress: SubmissionProgress<T>): SubmissionFullInfo<T> {
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
        if (progress.testcaseResult[testcaseHash].time != null) timeUsed += progress.testcaseResult[testcaseHash].time;
        if (progress.testcaseResult[testcaseHash].memory != null)
          memoryUsed = Math.max(memoryUsed, progress.testcaseResult[testcaseHash].memory);
      }
    }
  }

  return {
    ...progress,
    status,
    statusText,
    score: Math.round(score),
    timeUsed,
    memoryUsed
  };
}

interface SubmissionPageProps {
  meta: ApiTypes.SubmissionMetaDto;
  content: unknown;
  result: SubmissionResult;
  progress?: SubmissionProgress;
  progressSubscriptionKey?: string;
  permissionRejudge: boolean;
  permissionCancel: boolean;
  permissionSetPublic: boolean;
  permissionDelete: boolean;
  ProblemTypeSubmissionView: ProblemTypeSubmissionView;
}

let SubmissionPage: React.FC<SubmissionPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(`${_("submission.title")} #${props.meta.id}`);
  }, [appState.locale]);

  // The meta only provides fields not changing with progress
  // score, status, time, memory are in the full info
  // score and status are in this meta, but we still use them in full info
  const meta = props.meta;
  const [pending, setPending] = useState(meta.status === "Pending");
  const stateFullInfo = useState(
    pending
      ? parseProgress(props.progress as SubmissionProgress)
      : parseResult(meta, (props.result || {}) as SubmissionResult)
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

        if (message.resultMeta) {
          setPending(false);
          setFullInfo(
            parseResult(
              {
                ...meta,
                ...message.resultMeta
              },
              (message.resultDetail || {}) as SubmissionResult
            )
          );
        } else {
          setFullInfo(parseProgress(message.progressDetail as SubmissionProgress));
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

  const samples = (fullInfo && fullInfo.samples) || [];
  const samplesRunning = samples.some(sample => sample.running);
  const samplesFinishedCount = samples.filter(sample => !sample.running && !sample.waiting).length;
  const samplesDisplayInfo = {
    status: samplesFinishedCount < samples.length ? (samplesRunning ? "Running" : "Waiting") : null,
    statusText: ""
  };
  if (samplesDisplayInfo.status == null) {
    // Samples finished
    for (const sample of samples) {
      if (!sample.testcaseHash) {
        samplesDisplayInfo.status = "Skipped";
        break;
      } else if (fullInfo.testcaseResult[sample.testcaseHash].status !== "Accepted") {
        samplesDisplayInfo.status = fullInfo.testcaseResult[sample.testcaseHash].status;
        break;
      }
    }

    if (samplesDisplayInfo.status == null) samplesDisplayInfo.status = "Accepted";
  } else {
    samplesDisplayInfo.statusText = samplesDisplayInfo.status + " " + samplesFinishedCount + "/" + samples.length;
  }

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

  const getTestcasesAccordionPanels = (
    testcases: TestcaseProgressReference[],
    isSample: boolean,
    getAdditionalSections: GetAdditionalSectionsCallback
  ) =>
    testcases.map((testcase, i) => {
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
              {isSample ? _("submission.sample_testcase") : _("submission.testcase.title")} #{i + 1}
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
                      : Math.round(testcaseResult.time || 0) + " ms / " + testcaseResult.testcaseInfo.timeLimit + " ms"
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
                      : (testcaseResult.memory || 0) + " K / " + testcaseResult.testcaseInfo.memoryLimit * 1024 + " K"
                  }
                >
                  <Icon className={style.accordionTitleIcon} name="microchip" />
                  {formatFileSize((testcaseResult.memory || 0) * 1024, 1)}
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
                    {testcaseResult.testcaseInfo.inputFilename && (
                      <span
                        className={"monospace " + style.fileNameWrapper}
                        onClick={() => onDownload(testcaseResult.testcaseInfo.inputFilename)}
                      >
                        <span className={style.fileName}>{testcaseResult.testcaseInfo.inputFilename}</span>
                        <Icon name="download" />
                      </span>
                    )}
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
                    {testcaseResult.testcaseInfo.outputFilename && (
                      <span
                        className={"monospace " + style.fileNameWrapper}
                        onClick={() => onDownload(testcaseResult.testcaseInfo.outputFilename)}
                      >
                        <span className={style.fileName}>{testcaseResult.testcaseInfo.outputFilename}</span>
                        <Icon name="download" />
                      </span>
                    )}
                  </>
                }
                content={testcaseResult.output}
              />
            )}
            <CodeBox title={_("submission.testcase.user_output")} content={testcaseResult.userOutput} />
            <CodeBox title={_("submission.testcase.user_error")} content={testcaseResult.userError} />
            {getAdditionalSections(testcaseResult)}
            <CodeBox title={_("submission.testcase.system_message")} content={testcaseResult.systemMessage} />
          </Accordion.Content>
        )
      };
    });

  const getSamplePanel = (getAdditionalSections: GetAdditionalSectionsCallback) => ({
    key: "samples",
    title: (() => {
      const columnTitle = (width: SemanticWIDTHS) => (
        <Grid.Column width={width}>
          <Icon name="dropdown" />
          {_("submission.sample")}
        </Grid.Column>
      );

      const columnStatus = (width: SemanticWIDTHS) => (
        <Grid.Column width={width}>
          <StatusText status={samplesDisplayInfo.status} statusText={samplesDisplayInfo.statusText} />
        </Grid.Column>
      );

      if (isWideScreen) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(3)}
              {columnStatus(4)}
            </Grid>
          </Accordion.Title>
        );
      } else if (!isMobile) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(4)}
              {columnStatus(5)}
            </Grid>
          </Accordion.Title>
        );
      } else if (!isNarrowMobile) {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(4)}
              {columnStatus(7)}
            </Grid>
          </Accordion.Title>
        );
      } else {
        return (
          <Accordion.Title className={style.accordionTitle}>
            <Grid>
              {columnTitle(6)}
              {columnStatus(10)}
            </Grid>
          </Accordion.Title>
        );
      }
    })(),
    content: (
      <Accordion.Content className={style.accordionContent}>
        <Accordion
          className={"styled fluid " + style.subAccordion}
          panels={getTestcasesAccordionPanels(samples, true, getAdditionalSections)}
        />
      </Accordion.Content>
    )
  });

  // TODO: Hide time and memory usage when not present
  const getSubtasksAccordionPanels = (getAdditionalSections: GetAdditionalSectionsCallback) =>
    subtasks.map((subtask, i) => ({
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
      content: (
        <Accordion.Content className={style.accordionContent}>
          <Accordion
            className={"styled fluid " + style.subAccordion}
            panels={getTestcasesAccordionPanels(subtask.testcases, false, getAdditionalSections)}
          />
        </Accordion.Content>
      )
    }));

  const getSubtasksView = (getAdditionalSections: GetAdditionalSectionsCallback) =>
    fullInfo &&
    fullInfo.subtasks &&
    fullInfo.subtasks &&
    (subtasks.length === 1 ? (
      <Accordion
        className={"styled fluid " + style.accordion}
        panels={
          samples && samples.length > 0
            ? [
                getSamplePanel(getAdditionalSections),
                ...getTestcasesAccordionPanels(subtasks[0].testcases, false, getAdditionalSections)
              ]
            : getTestcasesAccordionPanels(subtasks[0].testcases, false, getAdditionalSections)
        }
      />
    ) : (
      <Accordion
        className={"styled fluid " + style.accordion}
        panels={
          samples && samples.length > 0
            ? [getSamplePanel(getAdditionalSections), ...getSubtasksAccordionPanels(getAdditionalSections)]
            : getSubtasksAccordionPanels(getAdditionalSections)
        }
      />
    ));

  const answerInfo = useMemo(() => props.ProblemTypeSubmissionView.getAnswerInfo(props.content, _), [props.content]);

  const [operationPending, setOperationPending] = useState(false);

  async function onCancel() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await SubmissionApi.cancelSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`submission.error.${response.error}`));
    else {
      toast.success(_("submission.success_cancel"));
    }

    setCancelPopupOpen(false);
    setOperationPending(false);
  }

  async function onRejudge() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await SubmissionApi.rejudgeSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`submission.error.${response.error}`));
    else {
      toast.success(_("submission.success_rejudge"));
      navigation.refresh();
    }

    setRejudgePopupOpen(false);
    setOperationPending(false);
  }

  async function onTogglePublic() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await SubmissionApi.setSubmissionPublic({
      submissionId: meta.id,
      isPublic: !meta.isPublic
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`submission.error.${response.error}`));
    else {
      toast.success(_(meta.isPublic ? "submission.success_set_non_public" : "submission.success_set_public"));
      navigation.refresh();
    }

    setTogglePublicPopupOpen(false);
    setOperationPending(false);
  }

  async function onDelete() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await SubmissionApi.deleteSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`submission.error.${response.error}`));
    else {
      toast.success(_("submission.success_delete"));
      navigation.navigate("/submissions");
    }

    setDeletePopupOpen(false);
    setOperationPending(false);
  }

  const statusNodeRef = useRef<HTMLElement>();

  const [operationsPopupOpen, setOperationsPopupOpen] = useState(false);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [rejudgePopupOpen, setRejudgePopupOpen] = useState(false);
  const [togglePublicPopupOpen, setTogglePublicPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const showRejudge = props.permissionRejudge;
  const showCancel = props.permissionCancel && pending;
  const showTogglePublic = props.permissionSetPublic;
  const showDelete = props.permissionDelete;

  const statusPopup = (statusNode: JSX.Element) =>
    !showRejudge && !showCancel ? (
      statusNode
    ) : (
      <>
        <Ref innerRef={e => e && e.tagName === "TD" && (statusNodeRef.current = e)}>
          <Popup
            className={style.operationsPopup}
            trigger={statusNode}
            open={operationsPopupOpen}
            onOpen={() => !cancelPopupOpen && !rejudgePopupOpen && setOperationsPopupOpen(true)}
            onClose={() => setOperationsPopupOpen(false)}
            disabled={operationPending}
            hoverable
            content={
              <Menu vertical className={style.operations}>
                {showCancel && (
                  <Menu.Item
                    content={
                      <>
                        <Icon name="ban" />
                        {_("submission.cancel")}
                      </>
                    }
                    onClick={() => (setOperationsPopupOpen(false), setCancelPopupOpen(true))}
                  />
                )}
                {showRejudge && (
                  <Menu.Item
                    content={
                      <>
                        <Icon name="refresh" />
                        {_("submission.rejudge")}
                      </>
                    }
                    onClick={() => (setOperationsPopupOpen(false), setRejudgePopupOpen(true))}
                  />
                )}
                {showTogglePublic && (
                  <Menu.Item
                    content={
                      <>
                        <Icon name={meta.isPublic ? "eye slash" : "eye"} />
                        {_(meta.isPublic ? "submission.set_non_public" : "submission.set_public")}
                      </>
                    }
                    onClick={() => (setOperationsPopupOpen(false), setTogglePublicPopupOpen(true))}
                  />
                )}
                {showDelete && (
                  <Menu.Item
                    content={
                      <>
                        <Icon name="delete" />
                        {_("submission.delete")}
                      </>
                    }
                    onClick={() => (setOperationsPopupOpen(false), setDeletePopupOpen(true))}
                  />
                )}
              </Menu>
            }
            position="bottom left"
            on="hover"
          />
        </Ref>
        {showCancel && (
          <Popup
            open={cancelPopupOpen}
            onClose={() => setCancelPopupOpen(false)}
            context={statusNodeRef.current}
            content={
              <Button negative content={_("submission.confirm_cancel")} loading={operationPending} onClick={onCancel} />
            }
            position="bottom left"
          />
        )}
        {showRejudge && (
          <Popup
            open={rejudgePopupOpen}
            onClose={() => setRejudgePopupOpen(false)}
            context={statusNodeRef.current}
            content={
              <Button
                negative
                content={_("submission.confirm_rejudge")}
                loading={operationPending}
                onClick={onRejudge}
              />
            }
            position="bottom left"
          />
        )}
        {showTogglePublic && (
          <Popup
            open={togglePublicPopupOpen}
            onClose={() => setTogglePublicPopupOpen(false)}
            context={statusNodeRef.current}
            content={
              <Button
                positive={!meta.isPublic}
                content={_(meta.isPublic ? "submission.confirm_set_non_public" : "submission.confirm_set_public")}
                loading={operationPending}
                onClick={onTogglePublic}
              />
            }
            position="bottom left"
          />
        )}
        {showDelete && (
          <Popup
            open={deletePopupOpen}
            onClose={() => setDeletePopupOpen(false)}
            context={statusNodeRef.current}
            content={
              <Button negative content={_("submission.confirm_delete")} loading={operationPending} onClick={onDelete} />
            }
            position="bottom left"
          />
        )}
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
              statusPopup={statusPopup}
            />
          </Table.Body>
        </Table>
      )}
      {!isWideScreen && (
        <SubmissionItemExtraRows
          submission={displayMeta}
          answerInfo={answerInfo}
          isMobile={isMobile}
          statusPopup={statusPopup}
        />
      )}
      <props.ProblemTypeSubmissionView
        fullInfo={fullInfo}
        content={props.content}
        getCompilationMessage={() =>
          fullInfo.compile &&
          fullInfo.compile.message && (
            <AnsiCodeBox title={_("submission.compilation_message")} ansiMessage={fullInfo.compile.message} />
          )
        }
        getSystemMessage={() =>
          fullInfo.systemMessage && (
            <AnsiCodeBox title={_("submission.system_message")} ansiMessage={fullInfo.systemMessage} />
          )
        }
        getSubtasksView={getSubtasksView}
      />
    </>
  );
};

SubmissionPage = observer(SubmissionPage);

export default defineRoute(async request => {
  const promises: Promise<unknown>[] = [CodeFormatter.ready];

  const queryResult = await fetchData(parseInt(request.params.id) || 0);

  const ProblemTypeSubmissionView = problemTypeSubmissionViews[queryResult.meta.problem.type];

  // Load highlight
  const highlightLanguageList = ProblemTypeSubmissionView.getHighlightLanguageList(queryResult.content);
  promises.concat((highlightLanguageList || []).map(CodeHighlighter.tryLoadTreeSitterLanguage));

  await Promise.all(promises);

  return (
    <SubmissionPage key={uuid()} {...(queryResult as any)} ProblemTypeSubmissionView={ProblemTypeSubmissionView} />
  );
});

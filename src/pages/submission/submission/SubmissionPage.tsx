import React, { useState, useRef, useEffect, useMemo } from "react";
import { Table, Icon, Accordion, Grid, SemanticWIDTHS, Button, Popup, Ref, Menu } from "semantic-ui-react";
import { observer } from "mobx-react";
import { v4 as uuid } from "uuid";
import { patch } from "jsondiffpatch";

import style from "./SubmissionPage.module.less";

import { appState } from "@/appState";
import api from "@/api";
import toast from "@/utils/toast";
import { useLocalizer, useSocket, useScreenWidthWithin, useNavigationChecked } from "@/utils/hooks";
import { SubmissionHeader, SubmissionItem, SubmissionItemExtraRows } from "../componments/SubmissionItem";
import StatusText from "@/components/StatusText";
import formatFileSize from "@/utils/formatFileSize";
import downloadFile from "@/utils/downloadFile";
import { SubmissionStatus } from "@/interfaces/SubmissionStatus";
import * as CodeFormatter from "@/utils/CodeFormatter";
import { OmittableAnsiCodeBox, OmittableString } from "@/components/CodeBox";
import { defineRoute, RouteError } from "@/AppRouter";
import { TestcaseResultCommon, ProblemTypeSubmissionView, GetAdditionalSectionsCallback } from "./common/interface";
import { SubmissionProgressMessageMetaOnly, SubmissionProgressType } from "../common";
import { makeToBeLocalizedText } from "@/locales";
import { EmojiRenderer } from "@/components/EmojiRenderer";

async function fetchData(submissionId: number) {
  const { requestError, response } = await api.submission.getSubmissionDetail({
    submissionId: submissionId.toString(),
    locale: appState.locale
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`submission.error.${response.error}`));

  type RemoveOptional<T> = {
    [K in keyof T]-?: T[K];
  };
  return response as RemoveOptional<ApiTypes.GetSubmissionDetailResponseDto>;
}

interface SubmissionProgressMessage extends SubmissionProgressMessageMetaOnly {
  progressDetail?: SubmissionProgress;
}

interface TestcaseProgressReference {
  // If !waiting && !running && !testcaseHash, it's "Skipped"
  waiting?: boolean;
  running?: boolean;
  testcaseHash?: string;
}

export interface SubmissionProgress<TestcaseResult extends TestcaseResultCommon = TestcaseResultCommon> {
  progressType: SubmissionProgressType;

  // Only valid when finished
  status?: SubmissionStatus;
  score?: number;

  compile?: {
    compileTaskHash: string;
    success: boolean;
    message: OmittableString;
  };

  systemMessage?: OmittableString;

  // testcaseHash
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

export interface SubmissionProgressMeta {
  pending: boolean;
  // e.g. "Running"
  status: string;
  // e.g. "Running 3/10"
  statusText?: string;
  score: number;
  timeUsed: number;
  memoryUsed: number;
}

function parseProgress<T extends TestcaseResultCommon>(
  progress: SubmissionProgress<T>,
  resultMeta?: ApiTypes.SubmissionBasicMetaDto
): SubmissionProgressMeta {
  if (!progress) {
    if (resultMeta?.status === "Canceled")
      return {
        pending: false,
        status: "Canceled",
        score: 0,
        timeUsed: 0,
        memoryUsed: 0
      };
    else
      return {
        pending: true,
        status: "Waiting",
        score: 0,
        timeUsed: 0,
        memoryUsed: 0
      };
  }

  let status = "",
    pending = true;
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
    case SubmissionProgressType.Finished:
      status = resultMeta.status;
      pending = false;
      break;
  }

  let statusText = null;
  let score = 0;

  if (progress.progressType === SubmissionProgressType.Finished) {
    // If finished, use the score from result meta
    score = resultMeta.score;
  } else if (progress.progressType === SubmissionProgressType.Running) {
    // If NOT finished, calculate score and append progress to the status text
    let totalCount = 0;
    let finishedCount = 0;
    statusText = status;
    if (Array.isArray(progress.subtasks)) {
      for (const subtask of progress.subtasks) {
        score += subtask.score;
        for (const testcase of subtask.testcases) {
          totalCount++;
          if (!testcase.running && !testcase.waiting) finishedCount++;
        }
      }
      statusText += ` ${finishedCount}/${totalCount}`;
    }
  }

  let timeUsed = 0;
  let memoryUsed = 0;
  if (progress.progressType === SubmissionProgressType.Finished) {
    // If finished, use the time/memory usage from result meta
    timeUsed = resultMeta.timeUsed;
    memoryUsed = resultMeta.memoryUsed;
  } else if (Array.isArray(progress.subtasks)) {
    // If NOT finished, calculate them
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
    pending,
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
  progress: SubmissionProgress;
  progressSubscriptionKey?: string;
  permissionRejudge: boolean;
  permissionCancel: boolean;
  permissionSetPublic: boolean;
  permissionDelete: boolean;
  ProblemTypeSubmissionView: ProblemTypeSubmissionView;
}

let SubmissionPage: React.FC<SubmissionPageProps> = props => {
  const _ = useLocalizer("submission");
  const navigation = useNavigationChecked();

  useEffect(() => {
    appState.enterNewPage(`${_(".title")} #${props.meta.id}`, "submissions");
  }, [appState.locale, props.meta]);

  // The meta only provides fields not changing with progress
  // score, status, time, memory are in the full info
  // score and status are in this meta, but we still use them in full info
  const meta: Pick<
    ApiTypes.SubmissionMetaDto,
    "id" | "problem" | "isPublic" | "codeLanguage" | "answerSize" | "submitTime" | "problemTitle" | "submitter"
  > = props.meta;

  const [progress, setProgress] = useState(props.progress);
  const [progressMeta, setProgressMeta] = useState(parseProgress(props.progress, props.meta));

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

        setProgress(message.progressDetail);
        setProgressMeta(parseProgress(message.progressDetail, message.progressMeta?.resultMeta));
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
    timeUsed: progressMeta.timeUsed,
    memoryUsed: progressMeta.memoryUsed,
    status: progressMeta.status as any,
    score: progressMeta.score
  };

  const refDefaultCopyCodeBox = useRef<HTMLPreElement>(null);

  // Ctrl-A to select all code
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (refDefaultCopyCodeBox.current && (event.ctrlKey || event.metaKey) && event.key === "a") {
        var sel = window.getSelection();
        var rg = document.createRange();
        rg.selectNodeContents(refDefaultCopyCodeBox.current);
        sel.removeAllRanges();
        sel.addRange(rg);
        event.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  async function onDownload(filename: string) {
    const { requestError, response } = await api.problem.downloadProblemFiles({
      problemId: meta.problem.id,
      type: "TestData",
      filenameList: [filename]
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else downloadFile(response.downloadInfo[0].downloadUrl);
  }

  const isWideScreen = useScreenWidthWithin(1024, Infinity);
  const isMobile = useScreenWidthWithin(0, 768);
  const isNarrowMobile = useScreenWidthWithin(0, 425);

  const samples = progress?.samples || [];
  const samplesRunning = samples.some(sample => sample.running);
  const samplesFinishedCount = samples.filter(sample => !sample.running && !sample.waiting).length;
  const samplesDisplayInfo = {
    status: samplesFinishedCount < samples.length ? (samplesRunning ? "Running" : "Waiting") : null,
    statusText: null
  };
  if (samplesDisplayInfo.status == null) {
    // Samples finished
    for (const sample of samples) {
      if (!sample.testcaseHash) {
        samplesDisplayInfo.status = "Skipped";
        break;
      } else if (progress.testcaseResult[sample.testcaseHash].status !== "Accepted") {
        samplesDisplayInfo.status = progress.testcaseResult[sample.testcaseHash].status;
        break;
      }
    }

    if (samplesDisplayInfo.status == null) samplesDisplayInfo.status = "Accepted";
  } else {
    samplesDisplayInfo.statusText = samplesDisplayInfo.status + " " + samplesFinishedCount + "/" + samples.length;
  }

  const subtasks = progress?.subtasks || [];
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
          const testcaseResult = progress.testcaseResult[testcase.testcaseHash];
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

  const hideTimeMemory = props.ProblemTypeSubmissionView?.config?.hideTimeMemory;

  const getTestcasesAccordionPanels = (
    testcases: TestcaseProgressReference[],
    isSample: boolean,
    getAdditionalSections: GetAdditionalSectionsCallback
  ) =>
    testcases.map((testcase, i) => {
      const testcaseResult = testcase.testcaseHash && progress.testcaseResult[testcase.testcaseHash];
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
              {isSample ? _(".sample_testcase") : _(".testcase.title")} #{i + 1}
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
            !hideTimeMemory &&
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
            !hideTimeMemory &&
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
              <OmittableAnsiCodeBox
                title={
                  <>
                    <strong>{_(".testcase.input")}</strong>
                    {testcaseResult.testcaseInfo.inputFile && (
                      <span
                        className={"monospace " + style.fileNameWrapper}
                        onClick={() => onDownload(testcaseResult.testcaseInfo.inputFile)}
                      >
                        <EmojiRenderer>
                          <span className={style.fileName}>{testcaseResult.testcaseInfo.inputFile}</span>
                        </EmojiRenderer>
                        <Icon name="download" />
                      </span>
                    )}
                  </>
                }
                ansiMessage={testcaseResult.input}
              />
            )}
            {testcaseResult.output && (
              <OmittableAnsiCodeBox
                title={
                  <>
                    <strong>{_(".testcase.output")}</strong>
                    {testcaseResult.testcaseInfo.outputFile && (
                      <span
                        className={"monospace " + style.fileNameWrapper}
                        onClick={() => onDownload(testcaseResult.testcaseInfo.outputFile)}
                      >
                        <EmojiRenderer>
                          <span className={style.fileName}>{testcaseResult.testcaseInfo.outputFile}</span>
                        </EmojiRenderer>
                        <Icon name="download" />
                      </span>
                    )}
                  </>
                }
                ansiMessage={testcaseResult.output}
              />
            )}
            <OmittableAnsiCodeBox title={_(".testcase.user_output")} ansiMessage={testcaseResult.userOutput} />
            <OmittableAnsiCodeBox title={_(".testcase.user_error")} ansiMessage={testcaseResult.userError} />
            {getAdditionalSections(testcaseResult)}
            <OmittableAnsiCodeBox title={_(".testcase.system_message")} ansiMessage={testcaseResult.systemMessage} />
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
          {_(".sample")}
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
      <Accordion.Content className={style.accordionContent + " " + style.subtaskContent}>
        <Accordion
          className={"styled fluid " + style.subAccordion}
          panels={getTestcasesAccordionPanels(samples, true, getAdditionalSections)}
        />
      </Accordion.Content>
    )
  });

  const getSubtasksAccordionPanels = (getAdditionalSections: GetAdditionalSectionsCallback) =>
    subtasks.map((subtask, i) => ({
      key: i,
      // If a subtask is unexpandable, make it unable to be "active"
      [!subtaskDisplayInfo[i].expandable ? "active" : ""]: false,
      title: (() => {
        const columnTitle = (width: SemanticWIDTHS) => (
          <Grid.Column width={width}>
            <Icon name="dropdown" />
            {_(".subtask.title")} #{i + 1}
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
        <Accordion.Content className={style.accordionContent + " " + style.subtaskContent}>
          <Accordion
            className={"styled fluid " + style.subAccordion}
            panels={getTestcasesAccordionPanels(subtask.testcases, false, getAdditionalSections)}
          />
        </Accordion.Content>
      )
    }));

  const getSubtasksView = (getAdditionalSections: GetAdditionalSectionsCallback) =>
    subtasks.length > 0 &&
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

  const answerInfo = useMemo(
    () =>
      props.ProblemTypeSubmissionView.getAnswerInfo && props.ProblemTypeSubmissionView.getAnswerInfo(props.content, _),
    [props.content]
  );
  const onDownloadAnswer =
    props.ProblemTypeSubmissionView?.getDownloadAnswerFilename &&
    (async () => {
      const { requestError, response } = await api.submission.downloadSubmissionFile({
        submissionId: props.meta.id,
        filename: props.ProblemTypeSubmissionView.getDownloadAnswerFilename(props.meta)
      });

      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(_(`.errors.${response.error}`));
      else downloadFile(response.url);
    });

  const [operationPending, setOperationPending] = useState(false);

  async function onCancel() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await api.submission.cancelSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      toast.success(_(".success_cancel"));
    }

    setCancelPopupOpen(false);
    setOperationPending(false);
  }

  async function onRejudge() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await api.submission.rejudgeSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      toast.success(_(".success_rejudge"));
      navigation.refresh();
    }

    setRejudgePopupOpen(false);
    setOperationPending(false);
  }

  async function onTogglePublic() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await api.submission.setSubmissionPublic({
      submissionId: meta.id,
      isPublic: !meta.isPublic
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      toast.success(_(meta.isPublic ? ".success_set_non_public" : ".success_set_public"));
      navigation.refresh();
    }

    setTogglePublicPopupOpen(false);
    setOperationPending(false);
  }

  async function onDelete() {
    if (operationPending) return;
    setOperationPending(true);

    const { requestError, response } = await api.submission.deleteSubmission({
      submissionId: meta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      toast.success(_(".success_delete"));
      navigation.navigate("/s");
    }

    setDeletePopupOpen(false);
    setOperationPending(false);
  }

  const [statusNodeRef, setStatusNodeRef] = useState<HTMLElement>();

  const [operationsPopupOpen, setOperationsPopupOpen] = useState(false);
  const [cancelPopupOpen, setCancelPopupOpen] = useState(false);
  const [rejudgePopupOpen, setRejudgePopupOpen] = useState(false);
  const [togglePublicPopupOpen, setTogglePublicPopupOpen] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);

  const showRejudge = props.permissionRejudge;
  const showCancel = props.permissionCancel && progressMeta.pending;
  const showTogglePublic = props.permissionSetPublic;
  const showDelete = props.permissionDelete;

  const statusPopup = (statusNode: JSX.Element) =>
    !showRejudge && !showCancel ? (
      statusNode
    ) : (
      <>
        <Ref innerRef={e => e && e.tagName === "TD" && setStatusNodeRef(e)}>
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
                        {_(".cancel")}
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
                        {_(".rejudge")}
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
                        {_(meta.isPublic ? ".set_non_public" : ".set_public")}
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
                        {_(".delete")}
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
            context={statusNodeRef}
            content={<Button negative content={_(".confirm_cancel")} loading={operationPending} onClick={onCancel} />}
            position="bottom left"
          />
        )}
        {showRejudge && (
          <Popup
            open={rejudgePopupOpen}
            onClose={() => setRejudgePopupOpen(false)}
            context={statusNodeRef}
            content={<Button negative content={_(".confirm_rejudge")} loading={operationPending} onClick={onRejudge} />}
            position="bottom left"
          />
        )}
        {showTogglePublic && (
          <Popup
            open={togglePublicPopupOpen}
            onClose={() => setTogglePublicPopupOpen(false)}
            context={statusNodeRef}
            content={
              <Button
                positive={!meta.isPublic}
                content={_(meta.isPublic ? ".confirm_set_non_public" : ".confirm_set_public")}
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
            context={statusNodeRef}
            content={<Button negative content={_(".confirm_delete")} loading={operationPending} onClick={onDelete} />}
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
            <SubmissionHeader
              page="submission"
              config={{
                hideTimeMemory
              }}
            />
          </Table.Header>
          <Table.Body>
            <SubmissionItem
              submission={displayMeta}
              statusText={progressMeta.statusText}
              answerInfo={answerInfo}
              onDownloadAnswer={onDownloadAnswer}
              page="submission"
              statusPopup={statusPopup}
              config={{
                hideTimeMemory
              }}
            />
          </Table.Body>
        </Table>
      )}
      {!isWideScreen && (
        <SubmissionItemExtraRows
          submission={displayMeta}
          answerInfo={answerInfo}
          onDownloadAnswer={onDownloadAnswer}
          isMobile={isMobile}
          statusPopup={statusPopup}
          config={{
            hideTimeMemory
          }}
        />
      )}
      <props.ProblemTypeSubmissionView
        progress={progress}
        progressMeta={progressMeta}
        content={props.content}
        getCompilationMessage={() =>
          progress?.compile?.message && (
            <OmittableAnsiCodeBox title={_(".compilation_message")} ansiMessage={progress.compile.message} />
          )
        }
        getSystemMessage={() =>
          progress?.systemMessage && (
            <OmittableAnsiCodeBox title={_(".system_message")} ansiMessage={progress.systemMessage} />
          )
        }
        getSubtasksView={getSubtasksView}
        refDefaultCopyCodeBox={refDefaultCopyCodeBox}
      />
    </>
  );
};

SubmissionPage = observer(SubmissionPage);

export default defineRoute(async request => {
  const queryResult = await fetchData(parseInt(request.params.id) || 0);

  const ProblemTypeSubmissionView: ProblemTypeSubmissionView = (
    await (() => {
      switch (queryResult.meta.problem.type) {
        case "Traditional":
          return import("./types/TraditionalProblemSubmissionView");
        case "Interaction":
          return import("./types/InteractionProblemSubmissionView");
        case "SubmitAnswer":
          return import("./types/SubmitAnswerProblemSubmissionView");
      }
    })()
  ).default;

  // Load highlight
  const highlightLanguageList =
    (ProblemTypeSubmissionView.getHighlightLanguageList &&
      ProblemTypeSubmissionView.getHighlightLanguageList(queryResult.content)) ||
    [];

  if (highlightLanguageList.some(lang => CodeFormatter.isLanguageSupported(lang))) {
    await CodeFormatter.ready;
  }

  return (
    <SubmissionPage key={uuid()} {...(queryResult as any)} ProblemTypeSubmissionView={ProblemTypeSubmissionView} />
  );
});

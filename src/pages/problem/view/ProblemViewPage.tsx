import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Label,
  Header,
  Statistic,
  Menu,
  Divider,
  Segment,
  Popup,
  Button,
  Form,
  Message,
  Loader
} from "semantic-ui-react";
import { useNavigation, Link } from "react-navi";
import { observer } from "mobx-react";
import update from "immutability-helper";
import objectPath from "object-path";
import { v4 as uuid } from "uuid";

import style from "./ProblemViewPage.module.less";

import { ProblemApi, SubmissionApi } from "@/api";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import { useLocalizer, useLoginOrRegisterNavigation, useDialog, useAsyncCallbackPending } from "@/utils/hooks";
import toast from "@/utils/toast";
import copyToClipboard from "@/utils/copyToClipboard";
import { isValidDisplayId } from "@/utils/validators";
import PermissionManager from "@/components/LazyPermissionManager";
import { sortTags } from "../problemTag";
import { defineRoute, RouteError } from "@/AppRouter";
import { StatusIcon } from "@/components/StatusText";
import { ProblemType } from "@/interfaces/ProblemType";
import { ProblemTypeView } from "./common/interface";
import MarkdownContent, { MarkdownContentPatcher } from "@/markdown/MarkdownContent";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";
import { callApiWithFileUpload } from "@/utils/callApiWithFileUpload";
import { getProblemDisplayName, getProblemUrl } from "../utils";
import { onEnterPress } from "@/utils/onEnterPress";
import { downloadProblemFile, downloadProblemFilesAsArchive } from "../files/ProblemFilesPage";
import { makeToBeLocalizedText } from "@/locales";

export function useProblemViewMarkdownContentPatcher(problemId: number): MarkdownContentPatcher {
  const _ = useLocalizer();

  const FILE_DOWNLOAD_LINK_PREFIX = "file:";
  const FILE_DOWNLOAD_LINK_ALL_PREFIX = "allfiles:";

  const FILE_DOWNLOAD_LINK_PREFIXES = [FILE_DOWNLOAD_LINK_PREFIX, FILE_DOWNLOAD_LINK_ALL_PREFIX];

  function isStartedWithFileDownloadPrefix(url: string) {
    return FILE_DOWNLOAD_LINK_PREFIXES.some(s => url.startsWith(s));
  }

  function tryParseAndDownload(fileUrl: string) {
    if (fileUrl.startsWith(FILE_DOWNLOAD_LINK_ALL_PREFIX)) {
      downloadProblemFilesAsArchive(
        problemId,
        fileUrl.substr(FILE_DOWNLOAD_LINK_ALL_PREFIX.length),
        "AdditionalFile",
        [],
        _
      );
      return true;
    } else if (fileUrl.startsWith(FILE_DOWNLOAD_LINK_PREFIX)) {
      let filename = fileUrl.substr(FILE_DOWNLOAD_LINK_PREFIX.length);
      while (filename.startsWith("/")) filename = filename.substr(1);

      downloadProblemFile(problemId, "AdditionalFile", filename, _);
      return true;
    }

    return false;
  }

  return {
    onPatchRenderer(renderer) {
      const originValidateLink = renderer.validateLink;
      renderer.validateLink = url => originValidateLink(url) || isStartedWithFileDownloadPrefix(url.toLowerCase());
    },
    onPatchResult(element) {
      async function onLinkClick(e: MouseEvent) {
        const targetElement = e.target as HTMLElement;
        if (targetElement.tagName === "A") {
          const a = targetElement as HTMLAnchorElement;
          if (tryParseAndDownload(a.href)) {
            e.preventDefault();
          }
        }
      }

      element.addEventListener("click", onLinkClick);
      return () => element.removeEventListener("click", onLinkClick);
    },
    onXssFileterAttr(tagName, attrName, value, escapeAttrValue) {
      if (tagName === "a" && attrName === "href" && isStartedWithFileDownloadPrefix(value)) return true;
    }
  };
}

async function fetchData(idType: "id" | "displayId", id: number, locale: Locale) {
  const { requestError, response } = await ProblemApi.getProblem({
    [idType]: id,
    localizedContentsOfLocale: locale,
    tagsOfLocale: locale,
    samples: true,
    judgeInfo: true,
    judgeInfoToBePreprocessed: true,
    statistics: true,
    discussionCount: true,
    permissionOfCurrentUser: ["Modify", "ManagePermission", "ManagePublicness", "Delete"],
    lastSubmissionAndLastAcceptedSubmission: true
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`problem.error.${response.error}`));

  sortTags(response.tagsOfLocale);
  return response;
}

interface ProblemViewPageProps {
  idType: "id" | "displayId";
  requestedLocale: Locale;
  problem: ApiTypes.GetProblemResponseDto;
  ProblemTypeView: ProblemTypeView<any>;
}

let ProblemViewPage: React.FC<ProblemViewPageProps> = props => {
  const _ = useLocalizer("problem");
  const navigation = useNavigation();

  const isMobile = useScreenWidthWithin(0, 768);

  const [idString, title, all] = getProblemDisplayName(
    props.problem.meta,
    props.problem.localizedContentsOfLocale.title,
    _,
    "tuple"
  );

  useEffect(() => {
    appState.enterNewPage(`${all} - ${_(".title")}`, "problem_set");
  }, [appState.locale]);

  // Begin toggle tags
  const [showTags, setShowTags] = useState(appState.showTagsInProblemSet);
  function toggleTags() {
    setShowTags(!showTags);
  }
  // End toggle tags

  // Begin copy sample
  const [lastCopiedSample, setLastCopiedSample] = useState<{ id: number; type: "input" | "output" }>({
    id: null,
    type: null
  });
  async function onCopySampleClick(id: number, type: "input" | "output", data: string) {
    if (await copyToClipboard(data)) {
      setLastCopiedSample({ id, type });
    } else {
      toast.error(_(".sample.failed_to_copy"));
    }
  }
  // End copy sample

  // Begin set display ID
  const [setDisplayIdInputValue, setSetDisplayIdInputValue] = useState((props.problem.meta.displayId || "").toString());
  const [setDisplayIdPending, onSetDisplayId] = useAsyncCallbackPending(async () => {
    if (!isValidDisplayId(setDisplayIdInputValue)) {
      toast.error(_(".error.INVALID_DISPLAY_ID"));
    } else {
      const { requestError, response } = await ProblemApi.setProblemDisplayId({
        problemId: props.problem.meta.id,
        displayId: Number(setDisplayIdInputValue)
      });

      if (requestError) toast.error(requestError(_));
      else if (response.error) {
        toast.error(
          _(`.error.${response.error}`, {
            displayId: setDisplayIdInputValue
          })
        );
      } else {
        navigation.navigate({
          pathname: !Number(setDisplayIdInputValue)
            ? getProblemUrl(props.problem.meta.id, { use: "id" })
            : getProblemUrl(Number(setDisplayIdInputValue), { use: "displayId" }),
          query: props.requestedLocale
            ? {
                locale: props.requestedLocale
              }
            : null
        });
      }
    }
  });
  // End set display ID

  // Begin set public
  const [setPublicPending, onSetPublic] = useAsyncCallbackPending(async (isPublic: boolean) => {
    const { requestError, response } = await ProblemApi.setProblemPublic({
      problemId: props.problem.meta.id,
      isPublic
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) {
      toast.error(_(`.error.${response.error}`));
    } else return navigation.refresh();
  });
  // End set public

  // Begin "localized content unavailable" message
  const [localizedContentUnavailableMessageVisable, setLocalizedContentUnavailableMessageVisable] = useState(true);
  // End "locaized content unavailable" message

  // Begin Permission Manager
  const refOpenPermissionManager = useRef<() => Promise<boolean>>();
  const [permissionManagerLoading, setPermissionManagerLoading] = useState(false);
  async function onGetInitialPermissions() {
    const { requestError, response } = await ProblemApi.getProblem({
      id: props.problem.meta.id,
      owner: true,
      permissions: true
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      return {
        owner: response.owner,
        userPermissions: response.permissions.userPermissions,
        groupPermissions: response.permissions.groupPermissions,
        haveSubmitPermission: props.problem.permissionOfCurrentUser.ManagePermission
      };
    }
    return null;
  }

  async function onSubmitPermissions(
    userPermissions: { userId: number; permissionLevel: number }[],
    groupPermissions: { groupId: number; permissionLevel: number }[]
  ) {
    const { requestError, response } = await ProblemApi.setProblemPermissions({
      problemId: props.problem.meta.id,
      userPermissions: userPermissions as any,
      groupPermissions: groupPermissions as any
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error === "NO_SUCH_PROBLEM") toast.error(_(".error.NO_SUCH_PROBLEM"));
    else if (response.error) return response;
    return true;
  }

  async function onClickPermissionManage() {
    if (permissionManagerLoading) return;
    setPermissionManagerLoading(true);
    await refOpenPermissionManager.current();
    setPermissionManagerLoading(false);
  }

  const permissionManager = (
    <PermissionManager
      objectDescription={_(".action.permission_manager_description", { idString })}
      permissionsLevelDetails={{
        1: {
          title: _(".permission_level.read")
        },
        2: {
          title: _(".permission_level.write")
        }
      }}
      refOpen={refOpenPermissionManager}
      onGetInitialPermissions={onGetInitialPermissions}
      onSubmitPermissions={onSubmitPermissions}
    />
  );
  // End Permission Manager

  // Begin delete
  const [deletePending, onDelete] = useAsyncCallbackPending(async () => {
    const { requestError, response } = await ProblemApi.deleteProblem({
      problemId: props.problem.meta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.error.${response.error}`));
    else {
      toast.success(_(".action.delete_success"));
      navigation.navigate("/problems");
    }
  });
  const deleteDialog = useDialog(
    {
      basic: true
    },
    () => (
      <>
        <Header icon="delete" className={style.dialogHeader} content={_(".action.delete_confirm_title")} />
      </>
    ),
    () => _(".action.delete_confirm_content"),
    () => (
      <>
        <Button
          basic
          inverted
          negative
          content={_(".action.delete_confirm")}
          loading={deletePending}
          onClick={onDelete}
        />
        <Button
          basic
          inverted
          content={_(".action.delete_cancel")}
          disabled={deletePending}
          onClick={() => deleteDialog.close()}
        />
      </>
    )
  );
  // End delete

  const ProblemTypeView = props.ProblemTypeView;

  // Begin submit
  const [inSubmitView, setInSubmitView] = useState(false);
  const refScrollTopBackup = useRef(0);
  const [submissionContent, setSubmissionContent] = useState(
    props.problem.lastSubmission.lastSubmissionContent || ProblemTypeView.getDefaultSubmissionContent()
  );
  const scrollElement = document.documentElement;

  function openSubmitView() {
    refScrollTopBackup.current = scrollElement.scrollTop;
    scrollElement.scrollTop = 0;
    setInSubmitView(true);
  }

  function closeSubmitView() {
    // Restore scroll top if we're not on a mobile view
    window.requestAnimationFrame(() => {
      scrollElement.scrollTop = isMobile ? 0 : refScrollTopBackup.current;
    });
    setInSubmitView(false);
  }

  function updateSubmissionContent(path: string, value: any) {
    const spec = {};
    objectPath.set(spec, path + ".$set", value);
    setSubmissionContent(update(submissionContent, spec));
  }

  const [submitPending, setSubmitPending] = useState(false);

  async function onSubmit(onGetSubmitFile?: () => Promise<Blob>) {
    if (submitPending) return;
    setSubmitPending(true);

    const { uploadError, requestError, response } = await callApiWithFileUpload(
      SubmissionApi.submit,
      {
        problemId: props.problem.meta.id,
        content: submissionContent
      },
      onGetSubmitFile ? await onGetSubmitFile() : null
    );

    if (uploadError) toast.error(_(".upload_error", { error: String(uploadError) }));
    else if (requestError) toast.error(requestError(_));
    else if (response.error) {
      toast.error(_(`.error.${response.error}`));
    } else navigation.navigate(`/submission/${response.submissionId}`);

    setSubmitPending(false);
  }
  // End submit

  const navigateToLogin = useLoginOrRegisterNavigation("login");

  const statistic = (
    <Statistic.Group size="small" className={style.statistic}>
      <Statistic>
        <Statistic.Value>{props.problem.meta.acceptedSubmissionCount}</Statistic.Value>
        <Statistic.Label>{_(".statistic.accepted")}</Statistic.Label>
      </Statistic>
      <Statistic>
        <Statistic.Value>{props.problem.meta.submissionCount}</Statistic.Value>
        <Statistic.Label>{_(".statistic.submissions")}</Statistic.Label>
      </Statistic>
    </Statistic.Group>
  );

  const problemViewMarkdownContentPatcher = useProblemViewMarkdownContentPatcher(props.problem.meta.id);

  return (
    <>
      {permissionManager}
      {deleteDialog.element}
      <div className={style.topContainer}>
        <div className={style.titleSection}>
          <Header as="h1" className={style.header}>
            {props.problem.lastSubmission.lastAcceptedSubmission && (
              <Link
                className={style.lastAcceptedSubmission}
                href={`/submission/${props.problem.lastSubmission.lastAcceptedSubmission.id}`}
              >
                <StatusIcon status="Accepted" />
              </Link>
            )}
            <strong>{idString}</strong>.&nbsp;
            {title}
            {props.problem.meta.locales.length > 1 && (
              <Dropdown icon="globe" className={style.languageSelectIcon}>
                <Dropdown.Menu>
                  {props.problem.meta.locales.map((locale: Locale) => (
                    <Dropdown.Item
                      key={locale}
                      onClick={() => {
                        navigation.navigate({
                          query: {
                            locale: locale
                          }
                        });
                      }}
                      flag={localeMeta[locale].flag}
                      text={_(`language.${locale}`)}
                      value={locale}
                      selected={locale === props.problem.localizedContentsOfLocale.locale}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Header>
          <div className={style.labels}>
            {!props.problem.meta.isPublic && (
              <Label size={isMobile ? "small" : null} color="red">
                <Icon name="eye slash" />
                {_(`.meta_labels.non_public`)}
              </Label>
            )}
            {!props.problem.meta.displayId && (
              <Label size={isMobile ? "small" : null} color="black">
                <Icon name="hashtag" />
                {_(`.meta_labels.no_display_id`)}
              </Label>
            )}
            <Label size={isMobile ? "small" : null} color="teal">
              <Icon name="book" />
              {_(`.type.${props.problem.meta.type}`)}
            </Label>
            <ProblemTypeView.Labels size={isMobile ? "small" : null} judgeInfo={props.problem.judgeInfo} />
            {props.problem.tagsOfLocale.length > 0 && (
              <>
                <Label
                  size={isMobile ? "small" : null}
                  color="grey"
                  as="a"
                  onClick={toggleTags}
                  className={style.toggleTagsLabel}
                >
                  {!showTags ? _(".show_tags") : _(".hide_tags")}
                  <Icon name={"caret down"} style={{ transform: showTags && "rotateZ(-90deg)" }} />
                </Label>
                {showTags && (
                  <>
                    {props.problem.tagsOfLocale.map(tag => (
                      <Label
                        size={isMobile ? "small" : null}
                        key={tag.id}
                        content={tag.name}
                        color={tag.color as any}
                        as={Link}
                        href={{
                          pathname: "/problems",
                          query: {
                            tagIds: tag.id.toString()
                          }
                        }}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {!isMobile && statistic}
      </div>
      <Divider className={style.divider} />
      <ProblemTypeView.SubmitView
        judgeInfo={props.problem.judgeInfo}
        lastSubmission={props.problem.lastSubmission}
        inSubmitView={inSubmitView}
        pendingSubmit={submitPending}
        submissionContent={submissionContent}
        onCloseSubmitView={closeSubmitView}
        onUpdateSubmissionContent={updateSubmissionContent}
        onSubmit={onSubmit}
      />
      <div className={style.statementView} style={{ display: inSubmitView ? "none" : null }}>
        <div className={style.leftContainer}>
          {(() => {
            if (!localizedContentUnavailableMessageVisable) return;
            let message: string;
            if (props.requestedLocale && props.problem.localizedContentsOfLocale.locale !== props.requestedLocale) {
              message = _("common.localized_content_unavailable.requested_unavailable", {
                display_locale: `<b>${_(`language.${props.problem.localizedContentsOfLocale.locale}`)}</b>`
              });
            } else if (
              !props.requestedLocale &&
              props.problem.localizedContentsOfLocale.locale !== appState.contentLocale
            ) {
              message = _("common.localized_content_unavailable.preferred_unavailable", {
                display_locale: `<b>${_(`language.${props.problem.localizedContentsOfLocale.locale}`)}</b>`
              });
            } else return;

            return (
              <Message
                onDismiss={() => setLocalizedContentUnavailableMessageVisable(false)}
                content={<span dangerouslySetInnerHTML={{ __html: message }} />}
              />
            );
          })()}
          {props.problem.localizedContentsOfLocale.contentSections.map((section, i) => (
            <React.Fragment key={i}>
              <Header size="large">{section.sectionTitle}</Header>
              {section.type === "Text" ? (
                <>
                  <MarkdownContent content={section.text} patcher={problemViewMarkdownContentPatcher} />
                </>
              ) : (
                <>
                  <Grid columns="equal">
                    <Grid.Row>
                      <Grid.Column className={style.sample + " " + style.sampleInput}>
                        <Header size="small" className={style.sampleHeader}>
                          {_(".sample.input")}
                          <Label
                            size="small"
                            as="a"
                            pointing="below"
                            className={style.copySample}
                            onClick={e =>
                              onCopySampleClick(
                                section.sampleId,
                                "input",
                                props.problem.samples[section.sampleId].inputData
                              )
                            }
                          >
                            {lastCopiedSample.id === section.sampleId && lastCopiedSample.type === "input"
                              ? _(".sample.copied")
                              : _(".sample.copy")}
                          </Label>
                        </Header>
                        <Segment className={style.sampleDataSegment}>
                          <pre className={style.sampleDataPre}>
                            <code>{props.problem.samples[section.sampleId].inputData}</code>
                          </pre>
                        </Segment>
                      </Grid.Column>
                      <Grid.Column
                        className={
                          style.sample +
                          " " +
                          style.sampleOutput +
                          (props.problem.samples[section.sampleId].outputData === "" ? " " + style.empty : "")
                        }
                      >
                        <Header size="small" className={style.sampleHeader}>
                          {_(".sample.output")}
                          <Label
                            size="small"
                            as="a"
                            pointing="below"
                            className={style.copySample}
                            onClick={e =>
                              onCopySampleClick(
                                section.sampleId,
                                "output",
                                props.problem.samples[section.sampleId].outputData
                              )
                            }
                          >
                            {lastCopiedSample.id === section.sampleId && lastCopiedSample.type === "output"
                              ? _(".sample.copied")
                              : _(".sample.copy")}
                          </Label>
                        </Header>
                        <Segment className={style.sampleDataSegment}>
                          <pre className={style.sampleDataPre}>
                            <code>{props.problem.samples[section.sampleId].outputData}</code>
                          </pre>
                        </Segment>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row className={style.sampleExplanation}>
                      <Grid.Column>
                        <MarkdownContent content={section.text} patcher={problemViewMarkdownContentPatcher} />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        {isMobile && (
          <>
            <Divider className={style.divider + " " + style.dividerBottom} />
            {statistic}
          </>
        )}
        <div className={style.rightContainer}>
          <div className={style.actionMenusWrapper}>
            <Menu pointing secondary vertical className={style.actionMenu}>
              <Popup
                trigger={
                  <Menu.Item
                    className={style.menuItemImportant}
                    name={_(".action.submit")}
                    icon="paper plane"
                    onClick={appState.currentUser ? openSubmitView : null}
                  />
                }
                disabled={!!appState.currentUser}
                content={<Button primary content={_(".action.login_to_submit")} onClick={() => navigateToLogin()} />}
                on="click"
                position="top left"
              />
              <Menu.Item
                name={_(".action.submission")}
                icon="list"
                as={Link}
                href={{
                  pathname: "/submissions",
                  query:
                    props.idType === "id"
                      ? {
                          problemId: props.problem.meta.id.toString()
                        }
                      : {
                          problemDisplayId: props.problem.meta.displayId.toString()
                        }
                }}
              />
              {ProblemTypeView.enableStatistics() && (
                <Menu.Item
                  name={_(".action.statistics")}
                  icon="sort content ascending"
                  as={Link}
                  href={
                    props.idType === "id"
                      ? `/submissions/statistics/by-id/${props.problem.meta.id}/fastest`
                      : `/submissions/statistics/${props.problem.meta.displayId}/fastest`
                  }
                />
              )}
              <Menu.Item
                as={Link}
                href={{
                  pathname: "/discussions",
                  query: {
                    problemId: props.problem.meta.id
                  }
                }}
              >
                <Icon name="comment alternate" />
                {_(".action.discussion")}
                {props.problem.discussionCount ? (
                  <Label
                    className={style.discussionCount}
                    circular
                    content={props.problem.discussionCount}
                    size="tiny"
                  />
                ) : null}
              </Menu.Item>
              <Menu.Item
                name={_(".action.files")}
                icon="folder open"
                as={Link}
                href={getProblemUrl(props.problem.meta, { subRoute: "files" })}
              />
            </Menu>
            <Menu pointing secondary vertical className={`${style.actionMenu} ${style.secondActionMenu}`}>
              {props.problem.permissionOfCurrentUser.Modify && (
                <Menu.Item
                  name={_(".action.edit")}
                  icon="edit"
                  as={Link}
                  href={{
                    pathname: getProblemUrl(props.problem.meta, { subRoute: "edit" }),
                    query: props.requestedLocale
                      ? {
                          locale: props.requestedLocale
                        }
                      : null
                  }}
                />
              )}
              {props.problem.permissionOfCurrentUser.Modify && (
                <Menu.Item
                  name={_(".action.judge_settings")}
                  icon="cog"
                  as={Link}
                  href={getProblemUrl(props.problem.meta, { subRoute: "judge-settings" })}
                />
              )}
              {
                // Normal users won't interested in permissions
                // Only show permission manage button when the user have write permission
                props.problem.permissionOfCurrentUser.Modify && (
                  <Menu.Item onClick={onClickPermissionManage}>
                    <Icon name="key" />
                    {_(".action.permission_manage")}
                    <Loader size="tiny" active={permissionManagerLoading} />
                  </Menu.Item>
                )
              }
              {props.problem.permissionOfCurrentUser.ManagePublicness && (
                <Popup
                  trigger={<Menu.Item name={_(".action.set_display_id")} icon="hashtag" />}
                  content={
                    <Form>
                      <Form.Input
                        style={{ width: 230 }}
                        placeholder={_(".action.set_display_id_new")}
                        value={setDisplayIdInputValue}
                        autoComplete="username"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSetDisplayIdInputValue(e.target.value)}
                        onKeyPress={onEnterPress(() => onSetDisplayId())}
                      />
                      <Button loading={setDisplayIdPending} onClick={onSetDisplayId}>
                        {_(".action.set_display_id_submit")}
                      </Button>
                    </Form>
                  }
                  on="click"
                  position="top left"
                />
              )}
              {props.problem.permissionOfCurrentUser.ManagePublicness && (
                <Popup
                  trigger={
                    <Menu.Item
                      name={props.problem.meta.isPublic ? _(".action.set_non_public") : _(".action.set_public")}
                      icon={props.problem.meta.isPublic ? "eye slash" : "eye"}
                    />
                  }
                  content={
                    <Button
                      loading={setPublicPending}
                      color={props.problem.meta.isPublic ? null : "green"}
                      content={
                        props.problem.meta.isPublic
                          ? _(".action.set_non_public_confirm")
                          : _(".action.set_public_confirm")
                      }
                      onClick={() => onSetPublic(!props.problem.meta.isPublic)}
                    />
                  }
                  on="click"
                  position="top left"
                />
              )}
              {props.problem.permissionOfCurrentUser.Delete && (
                <Menu.Item
                  className={style.menuItemDangerous}
                  name={_(".action.delete")}
                  icon="delete"
                  onClick={deleteDialog.open}
                />
              )}
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

ProblemViewPage = observer(ProblemViewPage);

async function getProblemTypeView(type: ProblemType): Promise<ProblemTypeView<any>> {
  return (
    await (() => {
      switch (type) {
        case ProblemType.Traditional:
          return import("./types/TraditionalProblemView");
        case ProblemType.Interaction:
          return import("./types/InteractionProblemView");
        case ProblemType.SubmitAnswer:
          return import("./types/SubmitAnswerProblemView");
      }
    })()
  ).default;
}

export default {
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]);
    const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
    const problem = await fetchData("id", id, requestedLocale || appState.contentLocale);

    return (
      <ProblemViewPage
        key={uuid()}
        idType="id"
        requestedLocale={requestedLocale}
        problem={problem}
        ProblemTypeView={await getProblemTypeView(problem.meta.type as ProblemType)}
      />
    );
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]);
    const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
    const problem = await fetchData("displayId", displayId, requestedLocale || appState.contentLocale);

    return (
      <ProblemViewPage
        key={uuid()}
        idType="displayId"
        requestedLocale={requestedLocale}
        problem={problem}
        ProblemTypeView={await getProblemTypeView(problem.meta.type as ProblemType)}
      />
    );
  })
};

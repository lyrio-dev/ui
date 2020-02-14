import React, { useEffect, useState, useRef } from "react";
import {
  Dropdown,
  Grid,
  Icon,
  Label,
  Container,
  Header,
  Statistic,
  Menu,
  Divider,
  Segment,
  Popup,
  Button,
  Form,
  Message,
  Loader,
  TextArea
} from "semantic-ui-react";
import { route } from "navi";
import { useNavigation, Link } from "react-navi";
import { observer } from "mobx-react";
import update from "immutability-helper";
import objectPath from "object-path";

import style from "./ProblemPage.module.less";

import { ProblemApi } from "@/api";
import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import { useIntlMessage, useLoginOrRegisterNavigation } from "@/utils/hooks";
import toast from "@/utils/toast";
import copyToClipboard from "@/utils/copy-to-clipboard";
import { isValidDisplayId } from "@/utils/validators";
import PermissionManager from "@/components/PermissionManager";
import { codeLanguageOptions, CodeLanguage, CodeLanguageOptionType } from "@/interfaces/CodeLanguage";
import { SubmissionApi } from "@/api-generated";

type Problem = ApiTypes.GetProblemResponseDto;

async function fetchData(idType: "id" | "displayId", id: number, locale: Locale): Promise<Problem> {
  const { requestError, response } = await ProblemApi.getProblem({
    [idType]: id,
    localizedContentsOfLocale: locale,
    samples: true,
    judgeInfo: true,
    permissionOfCurrentUser: ["MODIFY", "MANAGE_PERMISSION", "MANAGE_PUBLICNESS", "DELETE"]
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

function getLimit(judgeInfo: any, limit: "timeLimit" | "memoryLimit") {
  const isValidLimit = (x: any) => Number.isSafeInteger(x) && x >= 0;

  const taskLimit = isValidLimit(judgeInfo[limit]) ? judgeInfo[limit] : Infinity;

  let min = Infinity,
    max = -Infinity;
  for (const subtask of judgeInfo.subtasks || []) {
    const subtaskLimit = isValidLimit(subtask[limit]) ? subtask[limit] : taskLimit;
    for (const testcase of subtask.testcases || []) {
      const x = isValidLimit(testcase[limit]) ? testcase[limit] : subtaskLimit;
      if (x === 0) continue;

      min = Math.min(min, x);
      max = Math.max(max, x);
    }
  }

  if (!Number.isFinite(min)) return null;

  if (min === max) return min.toString();
  return min + " - " + max;
}

interface ProblemPageProps {
  idType: "id" | "displayId";
  requestedLocale: Locale;
  problem: Problem;
}

interface SubmissionContent {
  language: CodeLanguage;
  code: string;
  languageOptions: any;
}

let ProblemPage: React.FC<ProblemPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  const isMobile = appState.isScreenWidthIn(0, 768);

  const idString = props.idType === "id" ? `P${props.problem.meta.id}` : `#${props.problem.meta.displayId}`;

  useEffect(() => {
    appState.title = `${idString}. ${props.problem.localizedContentsOfLocale.title} - ${_("problem.title")}`;
  }, [appState.locale]);

  const timeLimit = getLimit(props.problem.judgeInfo, "timeLimit");
  const memoryLimit = getLimit(props.problem.judgeInfo, "memoryLimit");

  const randomTagCount = Math.round(Math.random() * 4);
  const tags = useState(
    ["NOIP", "模板", "图论", "素数", "线段树", "计算几何"]
      .sort(() => Math.random() - 0.5)
      .filter((_, i) => i <= randomTagCount)
  )[0];

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
      toast.error(_("problem.sample.failed_to_copy"));
    }
  }
  // End copy sample

  // Begin set display ID
  const [setDisplayIdInputValue, setSetDisplayIdInputValue] = useState((props.problem.meta.displayId || "").toString());
  const [setDisplayIdPending, setSetDisplayIdPending] = useState(false);
  async function onSetDisplayId() {
    if (setDisplayIdPending) return;
    setSetDisplayIdPending(true);

    if (!isValidDisplayId(setDisplayIdInputValue)) {
      toast.error(_("problem.action_error.set_display_id.INVALID_DISPLAY_ID"));
    } else {
      const { requestError, response } = await ProblemApi.setProblemDisplayId({
        problemId: props.problem.meta.id,
        displayId: parseInt(setDisplayIdInputValue)
      });

      if (requestError) toast.error(requestError);
      else if (response.error) {
        toast.error(
          _(`problem.action_error.set_display_id.${response.error}`, {
            displayId: setDisplayIdInputValue
          })
        );
      } else {
        if (!parseInt(setDisplayIdInputValue)) {
          // displayId removed
          navigation.navigate({
            pathname: `/problem/by-id/${props.problem.meta.id}`,
            query: props.requestedLocale
              ? {
                  locale: props.requestedLocale
                }
              : null
          });
        } else {
          // Redirect to new displayId
          navigation.navigate({
            pathname: `/problem/${setDisplayIdInputValue}`,
            query: props.requestedLocale
              ? {
                  locale: props.requestedLocale
                }
              : null
          });
        }
      }
    }

    setSetDisplayIdPending(false);
  }
  // End set display ID

  // Begin set public
  const [setPublicPending, setSetPublicPending] = useState(false);
  async function onSetPublic(isPublic: boolean) {
    if (setPublicPending) return;
    setSetPublicPending(true);

    const { requestError, response } = await ProblemApi.setProblemPublic({
      problemId: props.problem.meta.id,
      isPublic
    });

    if (requestError) toast.error(requestError);
    else if (response.error) {
      toast.error(_(`problem.action_error.set_public.${response.error}`));
    } else return navigation.refresh();

    setSetPublicPending(false);
  }
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
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`problem.action_error.get_permissions.${response.error}`));
    else {
      return {
        owner: response.owner,
        userPermissions: response.permissions.userPermissions,
        groupPermissions: response.permissions.groupPermissions
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
    if (requestError) toast.error(requestError);
    else if (response.error === "NO_SUCH_PROBLEM")
      toast.error(_("problem.action_error.set_permissions.NO_SUCH_PROBLEM"));
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
      haveSubmitPermission={props.problem.permissionOfCurrentUser.MANAGE_PERMISSION}
      objectDescription={_("problem.action.permission_manager_description", { idString })}
      permissionsLevelDetails={{
        1: {
          title: _("problem.permission_level.read")
        },
        2: {
          title: _("problem.permission_level.write")
        }
      }}
      refOpen={refOpenPermissionManager}
      onGetInitialPermissions={onGetInitialPermissions}
      onSubmitPermissions={onSubmitPermissions}
    />
  );
  // End Permission Manager

  // Begin submit
  function getPreferredDefaultSubmissionContent(language?: CodeLanguage): SubmissionContent {
    // TODO
    if (!language) language = CodeLanguage.CPP;
    return {
      language: language,
      code: "",
      languageOptions: Object.fromEntries(
        codeLanguageOptions[language].map(({ name, defaultValue }) => [name, defaultValue])
      )
    };
  }
  const [inSubmitView, setInSubmitView] = useState(false);
  const refScrollTopBackup = useRef(0);
  const [submissionContent, setSubmissionContent] = useState<SubmissionContent>(getPreferredDefaultSubmissionContent());
  const scrollView = document.getElementById("scrollView");

  function openSubmitView() {
    refScrollTopBackup.current = scrollView.scrollTop;
    scrollView.scrollTop = 0;
    setInSubmitView(true);
  }

  function closeSubmitView() {
    // Restore scroll top if we're not on a mobile view
    window.requestAnimationFrame(() => {
      scrollView.scrollTop = isMobile ? 0 : refScrollTopBackup.current;
    });
    setInSubmitView(false);
  }

  function updateSubmissionContent(path: string, value: any) {
    const spec = {};
    objectPath.set(spec, path + ".$set", value);
    setSubmissionContent(update(submissionContent, spec));
  }

  const [submitPending, setSubmitPending] = useState(false);

  async function onSubmit() {
    if (submitPending) return;
    setSubmitPending(true);

    const { requestError, response } = await SubmissionApi.submit({
      problemId: props.problem.meta.id,
      content: submissionContent
    });

    if (requestError) toast.error(requestError);
    else if (response.error) {
      toast.error(_(`problem.action_error.submit.${response.error}`));
    } else toast.success(`Submission ID: ${response.submissionId}`);

    setSubmitPending(false);
  }
  // End submit

  const navigateToLogin = useLoginOrRegisterNavigation("login");

  return (
    <>
      {permissionManager}
      <div className={style.flexContainer + " " + (inSubmitView ? style.inSubmitView : style.inStatementView)}>
        <div className={style.leftContainer}>
          <Container className={style.headerContainer}>
            <div>
              <Header as="h1">
                <strong>{idString}</strong>.&nbsp;
                {props.problem.localizedContentsOfLocale.title}
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
                    {_(`problem.meta_labels.non_public`)}
                  </Label>
                )}
                {!props.problem.meta.displayId && (
                  <Label size={isMobile ? "small" : null} color="black">
                    <Icon name="hashtag" />
                    {_(`problem.meta_labels.no_display_id`)}
                  </Label>
                )}
                <Label size={isMobile ? "small" : null} color="teal">
                  <Icon name="book" />
                  {_(`problem.type.${props.problem.meta.type}`)}
                </Label>
                {timeLimit && (
                  <Label size={isMobile ? "small" : null} color="pink">
                    <Icon name="clock" />
                    {timeLimit + " ms"}
                  </Label>
                )}
                {memoryLimit && (
                  <Label size={isMobile ? "small" : null} color="blue">
                    <Icon name="microchip" />
                    {memoryLimit + " MiB"}
                  </Label>
                )}
                <Label
                  size={isMobile ? "small" : null}
                  color="grey"
                  as="a"
                  onClick={toggleTags}
                  className={style.toggleTagsLabel}
                >
                  {!showTags ? _("problem.show_tags") : _("problem.hide_tags")}
                  <Icon name={"caret down"} style={{ transform: showTags && "rotateZ(-90deg)" }} />
                </Label>
                {// FIXME: Should we display tags in a <Popup> to prevent overflow the single-line design of <Label>s?
                showTags && (
                  <>
                    {tags.map(tag => (
                      <Label size={isMobile ? "small" : null} key={tag}>
                        {tag}
                      </Label>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Container>
          <Divider className={style.divider} />
          <Container className={style.submitView}>
            <Form>
              <TextArea
                value={submissionContent.code}
                onChange={(e, { value }) => updateSubmissionContent("code", value)}
              />
            </Form>
          </Container>
          <Container className={style.statementView}>
            {(() => {
              if (!localizedContentUnavailableMessageVisable) return;
              let message: string;
              if (props.requestedLocale && props.problem.localizedContentsOfLocale.locale !== props.requestedLocale) {
                message = _("common.localized_content_unavailable.requested_unavailable", {
                  display_locale: _(`language.${props.problem.localizedContentsOfLocale.locale}`)
                });
              } else if (!props.requestedLocale && props.problem.localizedContentsOfLocale.locale !== appState.locale) {
                message = _("common.localized_content_unavailable.preferred_unavailable", {
                  display_locale: _(`language.${props.problem.localizedContentsOfLocale.locale}`)
                });
              } else return;

              return (
                <Message onDismiss={() => setLocalizedContentUnavailableMessageVisable(false)} content={message} />
              );
            })()}
            {props.problem.localizedContentsOfLocale.contentSections.map((section, i) => (
              <React.Fragment key={i}>
                <Header size="large">{section.sectionTitle}</Header>
                {section.type === "TEXT" ? (
                  <>
                    <p>{section.text}</p>
                  </>
                ) : (
                  <>
                    <Grid columns="equal">
                      <Grid.Row>
                        <Grid.Column className={style.sample + " " + style.sampleInput}>
                          <Header size="small" className={style.sampleHeader}>
                            {_("problem.sample.input")}
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
                                ? _("problem.sample.copied")
                                : _("problem.sample.copy")}
                            </Label>
                          </Header>
                          <Segment className={style.sampleDataSegment}>
                            <pre className={style.sampleDataPre}>
                              <code>{props.problem.samples[section.sampleId].inputData}</code>
                            </pre>
                          </Segment>
                        </Grid.Column>
                        <Grid.Column className={style.sample + " " + style.sampleOutput}>
                          <Header size="small" className={style.sampleHeader}>
                            {_("problem.sample.output")}
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
                                ? _("problem.sample.copied")
                                : _("problem.sample.copy")}
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
                          <p>{section.text}</p>
                        </Grid.Column>
                      </Grid.Row>
                    </Grid>
                  </>
                )}
              </React.Fragment>
            ))}
          </Container>
        </div>
        {isMobile && <Divider className={style.divider + " " + style.dividerBottom} />}
        <div className={style.rightContainer}>
          <Statistic.Group size="small" className={style.headerRightStatisticGroup}>
            <Statistic>
              <Statistic.Value>114</Statistic.Value>
              <Statistic.Label>{_("problem.statistic.submissions")}</Statistic.Label>
            </Statistic>
            <Statistic>
              <Statistic.Value>514</Statistic.Value>
              <Statistic.Label>{_("problem.statistic.accepted")}</Statistic.Label>
            </Statistic>
          </Statistic.Group>
          <div className={style.actionMenusWrapper}>
            <div className={style.actionMenus + " " + style.submitViewMenu}>
              <Menu pointing secondary vertical className={style.actionMenu}>
                <Menu.Item name={_("problem.submit.back_to_statement")} icon="arrow left" onClick={closeSubmitView} />
                <div />
              </Menu>
              <Form className={style.submitViewForm}>
                <Form.Select
                  label={_("problem.submit.language")}
                  value={submissionContent.language}
                  options={Object.keys(codeLanguageOptions).map(language => ({
                    key: language,
                    value: language,
                    text: _(`code_language.${language}.name`)
                  }))}
                  onChange={(e, { value }) => updateSubmissionContent("language", value)}
                />
                {codeLanguageOptions[submissionContent.language].map(option => {
                  switch (option.type) {
                    case CodeLanguageOptionType.Select:
                      return (
                        <Form.Select
                          key={option.name}
                          label={_(`code_language.${submissionContent.language}.options.${option.name}.name`)}
                          value={submissionContent.languageOptions[option.name]}
                          options={option.values.map(value => ({
                            key: value,
                            value: value,
                            text: _(
                              `code_language.${submissionContent.language}.options.${option.name}.values.${value}`
                            )
                          }))}
                          onChange={(e, { value }) => updateSubmissionContent(`languageOptions.${option.name}`, value)}
                        />
                      );
                  }
                })}
                <Button
                  className={style.submitButton}
                  primary
                  fluid
                  icon="paper plane"
                  loading={submitPending}
                  content={_("problem.submit.submit")}
                  onClick={onSubmit}
                />
              </Form>
            </div>
            <div className={style.actionMenus + " " + style.statementViewMenu}>
              <Menu pointing secondary vertical className={style.actionMenu}>
                <Popup
                  trigger={
                    <Menu.Item
                      className={style.menuItemImportant}
                      name={_("problem.action.submit")}
                      icon="paper plane"
                      onClick={appState.loggedInUser ? openSubmitView : null}
                    />
                  }
                  disabled={!!appState.loggedInUser}
                  content={
                    <Button primary content={_("problem.action.login_to_submit")} onClick={() => navigateToLogin()} />
                  }
                  on="click"
                  position="top left"
                />
                <Menu.Item
                  name={_("problem.action.submission")}
                  icon="list"
                  onClick={() => console.log("submission")}
                />
                <Menu.Item
                  name={_("problem.action.statistics")}
                  icon="sort content ascending"
                  onClick={() => console.log("statistics")}
                />
                <Menu.Item
                  name={_("problem.action.discussion")}
                  icon="comment alternate"
                  onClick={() => console.log("discussion")}
                />
                <Menu.Item
                  name={_("problem.action.files")}
                  icon="folder open"
                  as={Link}
                  href={
                    props.idType === "id"
                      ? `/problem/by-id/${props.problem.meta.id}/files`
                      : `/problem/${props.problem.meta.displayId}/files`
                  }
                />
              </Menu>
              <Menu pointing secondary vertical className={`${style.actionMenu} ${style.secondActionMenu}`}>
                {props.problem.permissionOfCurrentUser.MODIFY && (
                  <Menu.Item
                    name={_("problem.action.edit")}
                    icon="edit"
                    as={Link}
                    href={{
                      pathname:
                        props.idType === "id"
                          ? `/problem/by-id/${props.problem.meta.id}/edit`
                          : `/problem/${props.problem.meta.displayId}/edit`,
                      query: props.requestedLocale
                        ? {
                            locale: props.requestedLocale
                          }
                        : null
                    }}
                  />
                )}
                {props.problem.permissionOfCurrentUser.MODIFY && (
                  <Menu.Item
                    name={_("problem.action.judge_settings")}
                    icon="cog"
                    as={Link}
                    href={
                      props.idType === "id"
                        ? `/problem/by-id/${props.problem.meta.id}/judge-settings`
                        : `/problem/${props.problem.meta.displayId}/judge-settings`
                    }
                  />
                )}
                {// Normal users won't interested in permissions
                // Only show permission manage button when the user have write permission
                props.problem.permissionOfCurrentUser.MODIFY && (
                  <Menu.Item onClick={onClickPermissionManage}>
                    <Icon name="key" />
                    {_("problem.action.permission_manage")}
                    <Loader size="tiny" active={permissionManagerLoading} />
                  </Menu.Item>
                )}
                {props.problem.permissionOfCurrentUser.MANAGE_PUBLICNESS && (
                  <Popup
                    trigger={
                      <Menu.Item
                        name={_("problem.action.set_display_id")}
                        icon="hashtag"
                        onClick={() => console.log("set_display_id")}
                      />
                    }
                    content={
                      <Form>
                        <Form.Input
                          style={{ width: 230 }}
                          placeholder={_("problem.action.set_display_id_new")}
                          value={setDisplayIdInputValue}
                          autoComplete="username"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSetDisplayIdInputValue(e.target.value)
                          }
                          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.keyCode === 13) {
                              e.preventDefault();
                              onSetDisplayId();
                            }
                          }}
                        />
                        <Button loading={setDisplayIdPending} onClick={onSetDisplayId}>
                          {_("problem.action.set_display_id_submit")}
                        </Button>
                      </Form>
                    }
                    on="click"
                    position="top left"
                  />
                )}
                {props.problem.permissionOfCurrentUser.MANAGE_PUBLICNESS && (
                  <Popup
                    trigger={
                      <Menu.Item
                        name={
                          props.problem.meta.isPublic
                            ? _("problem.action.set_non_public")
                            : _("problem.action.set_public")
                        }
                        icon={props.problem.meta.isPublic ? "eye slash" : "eye"}
                        onClick={() => console.log("toggle_public")}
                      />
                    }
                    content={
                      <Button
                        loading={setPublicPending}
                        color={props.problem.meta.isPublic ? null : "green"}
                        content={
                          props.problem.meta.isPublic
                            ? _("problem.action.set_non_public_confirm")
                            : _("problem.action.set_public_confirm")
                        }
                        onClick={() => onSetPublic(!props.problem.meta.isPublic)}
                      />
                    }
                    on="click"
                    position="top left"
                  />
                )}
                {props.problem.permissionOfCurrentUser.DELETE && (
                  <Menu.Item
                    className={style.menuItemDangerous}
                    name={_("problem.action.delete")}
                    icon="delete"
                    onClick={() => console.log("delete")}
                  />
                )}
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ProblemPage = observer(ProblemPage);

export default {
  byId: route({
    async getView(request) {
      const id = parseInt(request.params["id"]);
      const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
      const problem = await fetchData("id", id, requestedLocale || appState.locale);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemPage key={Math.random()} idType="id" requestedLocale={requestedLocale} problem={problem} />;
    }
  }),
  byDisplayId: route({
    async getView(request) {
      const displayId = parseInt(request.params["displayId"]);
      const requestedLocale: Locale = request.query["locale"] in Locale && (request.query["locale"] as Locale);
      const problem = await fetchData("displayId", displayId, requestedLocale || appState.locale);
      if (problem === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemPage key={Math.random()} idType="displayId" requestedLocale={requestedLocale} problem={problem} />;
    }
  })
};

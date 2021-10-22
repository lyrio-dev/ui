import React, { useEffect, useReducer, useRef, useState } from "react";
import { Button, ButtonGroup, Checkbox, Dropdown, Header, Icon, Label, Popup, Progress, Segment, SegmentGroup, Table } from "semantic-ui-react";
import dayjs from "dayjs";
import Countdown from "react-countdown";

import style from "./ContestViewPage.module.less"

import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import { appState } from "@/appState";
import { makeToBeLocalizedText } from "@/locales";
import { Link, useAsyncCallbackPending, useDialog, useLocalizer, useNavigationChecked, useScreenWidthWithin, useSocket } from "@/utils/hooks";
import MarkdownContent from "@/markdown/MarkdownContent";
import { getProblemDisplayName } from "@/pages/problem/utils";
import { Time } from "@/components/Time";

import { getContestDisplayName, getContestUrl } from "../utils";
import { DiscussionEditor } from "@/pages/discussion/view/DiscussionViewPage";
import toast from "@/utils/toast";
import UserLink from "@/components/UserLink";
import TimeAgo from "@/components/TimeAgo";
import UserAvatar from "@/components/UserAvatar";
import { Locale } from "@/interfaces/Locale";
import { LocalizeTab } from "@/components/LocalizeTab";
import localeMeta from "@/locales/meta";
import PermissionManager from "@/components/LazyPermissionManager";

type ContestStatus = "Pending" | "Running" | "Ended";

interface ContestProgressProps {
  startTime: Date;
  endTime: Date;
  duration: number;
}

const ContestProgress: React.FC<ContestProgressProps> = props => {
  // TODO: sync with server time
  const [now, setNow] = useState(new Date);

  useEffect(() => {
    const x = setInterval(() => setNow(new Date), 1000);
    return () => clearInterval(x);
  }, []);

  const elapsed = dayjs(now).diff(props.startTime, "s");
  const realProgress = elapsed / props.duration;
  const progress = realProgress > 100 ? 100 : realProgress < 0 ? 0 : realProgress;

  return (
    <div className={style.progress}>
      <div className={style.time}>
        <Label pointing="below" content={<Time date={props.startTime} />} />
        <div className={style.space} />
        <Label pointing="below" content={<Time date={props.endTime} />} />
      </div>
      <Progress className={style.bar} indicating percent={progress * 100} size="tiny" />
    </div>
  );
}

interface ContestIssuesViewProps {
  issues: ApiTypes.ContestIssueDto[];
  issuesSubscription: string;
  contest: ApiTypes.ContestMetaDto;
  status: ContestStatus;
  role: ApiTypes.GetContestResponseDto["currentUserRole"];
}

const ContestIssuesView: React.FC<ContestIssuesViewProps> = props => {
  const _ = useLocalizer("contest_view.issue");

  const running = props.status === "Running";
  const isInspector = props.role === "Admin" || props.role === "Inspector";
  const isParticipant = props.role === "Participant";

  const isMobile = useScreenWidthWithin(0, 768);

  const [issues, updateIssues] = useReducer((issues: ApiTypes.ContestIssueDto[], { id, issue }: { id: number, issue: Partial<ApiTypes.ContestIssueDto> }) => {
    const others = issues.filter(i => i.id !== id);
    if (!issue) return others;
    return others.concat({ ...(issues.find(i => i.id === id) || {}), ...issue } as ApiTypes.ContestIssueDto).sort((a, b) => {
      if (!!a.replyTime !== !!b.replyTime) return Number(!!a.replyTime) - Number(!!b.replyTime);
      return Date.parse(a.submitTime) - Date.parse(b.submitTime);
    });
  }, props.issues);

  const [showNonRepliedOnly, setShowNonRepliedOnly] = useState(false);

  const filteredIssues = showNonRepliedOnly ? issues.filter(issue => !issue.replyTime) : issues;

  const [createContent, setCreateContent] = useState("");
  const [createPending, submitCreate] = useAsyncCallbackPending(async () => {
    const { requestError, response } = await api.contest.createContestIssue({
      contestId: props.contest.id,
      content: createContent
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`contest_view.errors.${response.error}`));
    else {
      toast.success(_(".create_dialog.success"));
      updateIssues({
        id: response.id, issue: {
          id: response.id,
          contestId: props.contest.id,
          submitter: appState.currentUser,
          submitTime: response.submitTime,
          issueContent: createContent,
          replier: null,
          replyTime: null,
          replyContent: null
        }
      });
      createDialog.close();
    }
  });

  const createDialog = useDialog({}, () => (
    <Header
      icon="question circle"
      content={_(".create_dialog.header")}
    />
  ), () => (
    <>
      <div className={style.dialogMessage} children={_(".create_dialog.message")} />
      <DiscussionEditor
        type="RawEditor"
        content={createContent}
        onChangeContent={setCreateContent}
        placeholder={_(".create_dialog.placeholder")}
      />
    </>
  ), () => (
    <>
      <Button content={_(".create_dialog.cancel")} onClick={() => createDialog.close()} />
      <Popup
        content={
          <Button positive content={_(".create_dialog.confirm_submit")} onClick={submitCreate} />
        }
        trigger={
          <Button primary content={_(".create_dialog.submit")} disabled={createContent.length === 0} loading={createPending} />
        }
        disabled={createContent.length === 0 || createPending}
        on="click"
        position={isMobile ? "left center" : "top center"}
      />
    </>
  ));

  const renderIssue = (issue: ApiTypes.ContestIssueDto, isReply: boolean, extra?: React.ReactNode) => (
    <div className={style.issue}>
      <div className={style.header}>
        <UserAvatar className={style.avatar} userAvatar={(isReply ? issue.replier : issue.submitter).avatar} imageSize={25} />
        <span className={style.text}>
          <UserLink className={style.username} user={isReply ? issue.replier : issue.submitter} />
          {_(isReply ? ".replied_on" : ".created_on")}&nbsp;
          <TimeAgo time={isReply ? issue.replyTime : issue.submitTime} />
        </span>
        <div className={style.divider} />
        {extra}
      </div>
      <MarkdownContent content={isReply ? issue.replyContent : issue.issueContent} />
    </div>
  );

  const [replyingIssue, setReplyingIssue] = useState<ApiTypes.ContestIssueDto>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replyPending, submitReply] = useAsyncCallbackPending(async () => {
    const { requestError, response } = await api.contest.replyContestIssue({
      contestIssueId: replyingIssue.id,
      content: replyContent
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`contest_view.errors.${response.error}`));
    else {
      toast.success(_(".reply_dialog.success"));
      updateIssues({
        id: replyingIssue.id, issue: {
          replier: appState.currentUser,
          replyTime: response.replyTime,
          replyContent: replyContent
        }
      });
      replyDialog.close();
    }
  });
  const replyDialog = useDialog({}, () => (
    <Header
      icon="info circle"
      content={_(replyingIssue.replyContent ? ".reply_dialog.header_update" : ".reply_dialog.header")}
    />
  ), () => (
    <>
      <div className={style.replyingIssue}>
        {renderIssue(replyingIssue, false)}
      </div>
      <DiscussionEditor
        type="RawEditor"
        content={replyContent}
        onChangeContent={setReplyContent}
        placeholder={_(".reply_dialog.placeholder")}
      />
    </>
  ), () => {
    const disallowSubmit = (replyContent === (replyingIssue.replyContent || "") || replyContent === "");

    return (
      <>
        <Popup
          content={
            <Button negative content={_(".reply_dialog.confirm_cancel")} onClick={() => replyDialog.close()} />
          }
          trigger={
            <Button content={_(".reply_dialog.cancel")} onClick={() => disallowSubmit && replyDialog.close()} />
          }
          disabled={replyPending || disallowSubmit}
          on="click"
          position={isMobile ? "left center" : "top center"}
        />
        <Popup
          content={
            <Button positive content={_(".reply_dialog.confirm_submit")} onClick={submitReply} />
          }
          trigger={
            <Button primary content={_(".reply_dialog.submit")} disabled={disallowSubmit} loading={replyPending} />
          }
          disabled={replyPending}
          on="click"
          position={isMobile ? "left center" : "top center"}
        />
      </>
    )
  });

  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  async function deleteIssue(id: number) {
    if (pendingDeleteIds.includes(id)) return;
    setPendingDeleteIds(ids => [...ids, id]);

    await new Promise(r => setTimeout(r, 1000));
    const { requestError, response } = await api.contest.deleteContestIssue({ contestIssueId: id });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`contest_view.errors.${response.error}`));
    else {
      toast.success(_(".delete_success"));
      updateIssues({ id, issue: null });
    }

    setPendingDeleteIds(ids => ids.filter(x => x !== id));
  }

  const isFirstMessage = useRef(false);
  useSocket("push", { subscriptionKey: props.issuesSubscription }, socket => {
    socket.on("message", (message: Record<number, ApiTypes.ContestIssueDto>) => {
      console.log(message);
      
      let updated = false;
      Object.entries(message).forEach(([id, issue]) => {
        if (issue) updated = true;
        updateIssues({ id: Number(id), issue })
      });

      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        return;
      }

      if (updated && isParticipant) alert(_(".your_issue_replied"));
    });
  }, socket => {
    console.log("connected");
    isFirstMessage.current = true;
  }, !!props.issuesSubscription);

  // Hide issues on (not enabled) or (contest ended and no issues created)
  const hidden = !props.contest.contestOptions.enableIssues || (issues.length === 0 && !running);

  return !hidden && (
    <>
      <div className={style.headerWrapper}>
        <Header size="large" content={_(".header")} />
        {
          running && isParticipant && (
            <>
              {createDialog.element}
              <Button className={style.rightButton} size="medium" content={_(".create")} primary onClick={createDialog.open} />
            </>
          )
        }
        {
          isInspector && (
            <Checkbox className={style.rightButton} toggle label={_(".show_non_replied_only")} checked={showNonRepliedOnly} onChange={(_, { checked }) => setShowNonRepliedOnly(checked)} />
          )
        }
      </div>
      {
        running && isInspector && replyDialog.element
      }
      {
        filteredIssues.length ? (
          filteredIssues.map(issue => (
            <SegmentGroup key={issue.id}>
              <Segment className={style.issueSegment} color={!issue.replyTime ? "blue" : "pink"}>
                {
                  renderIssue(issue, false, isInspector && (
                    <>
                      <div className={style.icon} title={_(".reply")} data-disabled={pendingDeleteIds.includes(issue.id)} onClick={() => {
                        if (!pendingDeleteIds.includes(issue.id)) {
                          setReplyingIssue(issue);
                          setReplyContent(issue.replyContent || "");
                          replyDialog.open();
                        }
                      }}>
                        <Icon name="reply" />
                      </div>
                      <Popup
                        content={
                          <Button negative content={_(".confirm_delete")} onClick={() => deleteIssue(issue.id)} />
                        }
                        trigger={
                          <div className={style.icon} data-disabled={pendingDeleteIds.includes(issue.id)} title={_(".delete")}>
                            {
                              pendingDeleteIds.includes(issue.id)
                                ? <Icon name="circle notched" loading />
                                : <Icon name="delete" />
                            }
                          </div>
                        }
                        disabled={pendingDeleteIds.includes(issue.id)}
                        position={isMobile ? "left center" : "top center"}
                        on="click"
                      />
                    </>
                  ))
                }
              </Segment>
              {
                issue.replyTime && (
                  <Segment className={style.issue}>
                    {renderIssue(issue, true)}
                  </Segment>
                )
              }
            </SegmentGroup>
          ))
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="comments" />
              {_(filteredIssues ? ".no_non_replied_issues" : ".no_issues")}
            </Header>
          </Segment>
        )
      }
    </>
  );
};

interface ContestAnnouncementViewProps {
  announcement: ApiTypes.ContestAnnouncementDto;
  contest: ApiTypes.ContestMetaDto;
  status: ContestStatus;
  role: ApiTypes.GetContestResponseDto["currentUserRole"];
  extra: React.ReactNode;
}

const ContestAnnouncementView: React.FC<ContestAnnouncementViewProps> = props => {
  const _ = useLocalizer("contest_view.announcement");
  const { announcement } = props;

  const locales = new Set(props.announcement.localizedContents.map(c => c.locale));
  const [locale, setLocale] = useState(() => locales.has(appState.locale) ? appState.locale : props.announcement.localizedContents[0].locale);

  const [localeDropdownOpen, setLocaleDropdownOpen] = useState(false);

  return (
    <div className={style.announcement}>
      <div className={style.header}>
        <UserAvatar className={style.avatar} userAvatar={announcement.publisher.avatar} imageSize={25} />
        <span className={style.text}>
          <UserLink className={style.username} user={announcement.publisher} />
          {_(".published_on")}&nbsp;
          <TimeAgo time={announcement.publishTime} />
        </span>
        <div className={style.divider} />
        {
          locales.size > 1 && (
            <div className={style.icon + (localeDropdownOpen ? " " + style.active : "")}>
              <Icon name="globe" />
              <Dropdown direction="left" className={style.dropdown} icon="globe" title={_(".locale")} open={localeDropdownOpen} onOpen={() => setLocaleDropdownOpen(true)} onClose={() => setLocaleDropdownOpen(false)}>
                <Dropdown.Menu>
                  {Object.keys(localeMeta).filter((l: Locale) => locales.has(l)).map((l: Locale) => (
                    <Dropdown.Item
                      key={l}
                      onClick={() => setLocale(l)}
                      flag={localeMeta[l].flag}
                      text={localeMeta[l].name}
                      value={l}
                      selected={l === locale}
                    />
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            </div>
          )
        }
        {props.extra}
      </div>
      <MarkdownContent content={announcement.localizedContents.find(c => c.locale === locale).content} />
    </div>
  );
};

interface ContestAnnouncementsViewProps {
  announcements: ApiTypes.ContestAnnouncementDto[];
  announcementsSubscription: string;
  contest: ApiTypes.ContestMetaDto;
  status: ContestStatus;
  role: ApiTypes.GetContestResponseDto["currentUserRole"];
}

const ContestAnnouncementsView: React.FC<ContestAnnouncementsViewProps> = props => {
  const _ = useLocalizer("contest_view.announcement");

  const running = props.status === "Running";
  const isInspector = props.role === "Admin" || props.role === "Inspector";
  const isParticipant = props.role === "Participant";

  const isMobile = useScreenWidthWithin(0, 768);

  const [announcements, updateAnnouncement] = useReducer((announcements: ApiTypes.ContestAnnouncementDto[], { id, announcement }: { id: number, announcement: Partial<ApiTypes.ContestAnnouncementDto> }) => {
    const others = announcements.filter(i => i.id !== id);
    if (!announcement) return others;
    return others.concat({ ...(announcements.find(i => i.id === id) || {}), ...announcement } as ApiTypes.ContestAnnouncementDto).sort((a, b) => {
      return Date.parse(b.publishTime) - Date.parse(a.publishTime);
    });
  }, props.announcements);

  const defaultCreateLocalizedContents = { [appState.locale]: "" } as Record<Locale, string>;
  const [createLocalizedContents, setCreateLocalizedContents] = useState(defaultCreateLocalizedContents);
  const [createPending, submitCreate] = useAsyncCallbackPending(async () => {
    const content = Object.entries(createLocalizedContents).map(([locale, content]) => ({ locale, content }) as ApiTypes.ContestAnnouncementLocalizedContentDto);
    const { requestError, response } = await api.contest.createContestAnnouncement({
      contestId: props.contest.id,
      content
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`contest_view.errors.${response.error}`));
    else {
      toast.success(_(".create_dialog.success"));
      updateAnnouncement({
        id: response.id, announcement: {
          id: response.id,
          contestId: props.contest.id,
          publisher: appState.currentUser,
          publishTime: response.publishTime,
          localizedContents: content
        }
      });
      createDialog.close();
      setCreateLocalizedContents(defaultCreateLocalizedContents);
    }
  });
  const createEmpty = Object.values(createLocalizedContents).some(c => c.length === 0);

  const createDialog = useDialog({}, () => (
    <Header
      icon="info circle"
      content={_(".create_dialog.header")}
    />
  ), () => (
    <>
      <LocalizeTab
        localizedContents={createLocalizedContents}
        setLocalizedContents={setCreateLocalizedContents}
        item={(locale, content, setDefaultLocale, deleteLocale) => (
          <div className={style.localizeTab}>
            <div className={style.buttons}>
              {setDefaultLocale && <Button content={_(".create_dialog.set_default_locale")} onClick={setDefaultLocale} />}
              {deleteLocale && (
                <Popup
                  trigger={<Button negative content={_(".create_dialog.delete_locale")} />}
                  content={<Button negative content={_(".create_dialog.confirm_delete_locale")} onClick={deleteLocale} />}
                  on="click"
                  position={isMobile ? "left center" : "top center"}
                />
              )}
            </div>
            <div>
              <DiscussionEditor
                type="RawEditor"
                content={content}
                onChangeContent={content =>
                  setCreateLocalizedContents(c => ({
                    ...c,
                    [locale]: content
                  }))
                }
                placeholder={_(".create_dialog.placeholder")}
              />
            </div>
          </div>
        )}
        defaultLocalizedContent=""
      />
    </>
  ), () => (
    <>
      <Button content={_(".create_dialog.cancel")} onClick={() => createDialog.close()} />
      <Popup
        content={
          <Button positive content={_(".create_dialog.confirm_submit")} onClick={submitCreate} />
        }
        trigger={
          <Button primary content={_(".create_dialog.submit")} disabled={createEmpty} loading={createPending} />
        }
        disabled={createEmpty || createPending}
        on="click"
        position={isMobile ? "left center" : "top center"}
      />
    </>
  ));

  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  async function deleteAnnouncement(id: number) {
    if (pendingDeleteIds.includes(id)) return;
    setPendingDeleteIds(ids => [...ids, id]);

    await new Promise(r => setTimeout(r, 1000));
    const { requestError, response } = await api.contest.deleteContestAnnouncement({ contestAnnouncementId: id });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`contest_view.errors.${response.error}`));
    else {
      toast.success(_(".delete_success"));
      updateAnnouncement({ id, announcement: null });
    }

    setPendingDeleteIds(ids => ids.filter(x => x !== id));
  }

  const isFirstMessage = useRef(false);
  useSocket("push", { subscriptionKey: props.announcementsSubscription }, socket => {
    socket.on("message", (message: Record<number, ApiTypes.ContestIssueDto>) => {
      console.log(message);
      
      let updated = false;
      Object.entries(message).forEach(([id, announcement]) => {
        if (announcement) updated = true;
        updateAnnouncement({ id: Number(id), announcement })
      });

      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        return;
      }

      if (updated && isParticipant) alert(_(".new_announcement_alert"));
    });
  }, socket => {
    console.log("connected");
    isFirstMessage.current = true;
  }, !!props.announcementsSubscription);

  // Hide announcement section for participants when empty
  const hidden = isParticipant && announcements.length === 0;

  return !hidden && (
    <>
      <div className={style.headerWrapper}>
        <Header size="large" content={_(".header")} />
        {
          running && isInspector && (
            <>
              {createDialog.element}
              <Button className={style.rightButton} size="medium" content={_(".create")} primary onClick={createDialog.open} />
            </>
          )
        }
      </div>
      {
        announcements.length ? (
          announcements.map(announcement => (
            <SegmentGroup key={announcement.id}>
              <Segment className={style.announcementSegment} color="orange">
                <ContestAnnouncementView
                  contest={props.contest}
                  announcement={announcement}
                  status={props.status}
                  role={props.role}
                  extra={
                    isInspector && (
                      <>
                        <Popup
                          content={
                            <Button negative content={_(".confirm_delete")} onClick={() => deleteAnnouncement(announcement.id)} />
                          }
                          trigger={
                            <div className={style.icon} data-disabled={pendingDeleteIds.includes(announcement.id)} title={_(".delete")}>
                              {
                                pendingDeleteIds.includes(announcement.id)
                                  ? <Icon name="circle notched" loading />
                                  : <Icon name="delete" />
                              }
                            </div>
                          }
                          disabled={pendingDeleteIds.includes(announcement.id)}
                          position={isMobile ? "left center" : "top center"}
                          on="click"
                        />
                      </>
                    )
                  }
                />
              </Segment>
            </SegmentGroup>
          ))
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="comments" />
              {_(".no_announcements")}
            </Header>
          </Segment>
        )
      }
    </>
  );
};

type ContestViewPageProps = ApiTypes.GetContestResponseDto;

const ContestViewPage: React.FC<ContestViewPageProps> = props => {
  const _ = useLocalizer("contest_view");
  const navigation = useNavigationChecked();

  const { contest } = props;

  useEffect(() => {
    appState.enterNewPage(_(".title", { title: contest.name }), "contests");
  }, [appState.locale]);

  const isMobile = useScreenWidthWithin(0, 768);

  const duration = contest.participantDuration || dayjs(contest.endTime).diff(contest.startTime, "s");
  const startTime = new Date(contest.startTime);
  const participantEndTime = contest.participantDuration ? dayjs(contest.startTime).add(contest.participantDuration, "s").toDate() : new Date(contest.endTime);

  const now = new Date;
  const status: ContestStatus = now < startTime ? "Pending" : now > participantEndTime ? "Ended" : "Running";

  const role = props.currentUserRole;
  const hasManagePermission = appState.currentUserHasPrivilege("ManageContest");
  const hasEditPermission = props.permissions.includes("Modify" as any);
  const isInspector = role === "Admin" || role === "Inspector";
  const isParticipant = role === "Participant";

  const refOpenPermissionManager = useRef<() => Promise<boolean>>();
  const permissionManager = (
    <PermissionManager
      objectDescription={_(".permission_manager_description", { id: props.contest.id })}
      permissionsLevelDetails={{
        1: {
          title: _(".permission_level.view")
        },
        2: {
          title: _(".permission_level.participate")
        },
        3: {
          title: _(".permission_level.inspect")
        },
        4: {
          title: _(".permission_level.modify")
        }
      }}
      refOpen={refOpenPermissionManager}
      onGetInitialData={async () => {
        const { requestError, response } = await api.contest.getContestAccessControlList({
          id: props.contest.id
        });
        if (requestError) toast.error(requestError(_));
        else if (response.error) toast.error(_(`.error.${response.error}`));
        else {
          return response;
        }
        return null;
      }}
      onSubmit={async accessControlList => {
        const { requestError, response } = await api.contest.setContestAccessControlList({
          contestId: props.contest.id,
          accessControlList
        });
        if (requestError) toast.error(requestError(_));
        else if (response.error === "NO_SUCH_CONTEST") toast.error(_(".errors.NO_SUCH_CONTEST"));
        else if (response.error) return response;
        return true;
      }}
    />
  );

  async function onDelete() {
    ;
  }

  const actions = [
    hasEditPermission && <Dropdown.Item icon="edit" text={_(".actions.edit")} as={Link} href={getContestUrl(props.contest, "edit")} />,
    hasManagePermission && <Dropdown.Item icon="key" text={_(".actions.permission_manage")} onClick={() => refOpenPermissionManager.current()} />,
    hasManagePermission && <Dropdown.Item className={style.delete} icon="delete" text={_(".actions.delete")} onClick={onDelete} />
  ].filter(x => x);

  return (
    <>
      {permissionManager}
      <div className={style.container}>
        <div className={style.left}>
          <Header
            as="h1"
            content={
              <>
                {getContestDisplayName(contest.name, _)}
                {
                  actions.length > 0 && (
                    <Dropdown icon="setting" className={style.manageActions}>
                      <Dropdown.Menu>
                        {actions.map((e, i) => <React.Fragment key={i} children={e} />)}
                      </Dropdown.Menu>
                    </Dropdown>
                  )
                }
              </>
            }
          />
          {
            props.description && <MarkdownContent content={props.description} />
          }
          <ContestProgress startTime={startTime} endTime={participantEndTime} duration={duration} />
          {
            contest.problems.length === 0 ? (
              <Segment placeholder>
                <Header icon>
                  <Icon name="file" />
                  {_(".no_problems")}
                </Header>
              </Segment>
            ) : (
              <Table unstackable celled={!isMobile}>
                <Table.Header>
                  <Table.Row>
                    {
                      isMobile ? (
                        <Table.HeaderCell>
                          { /* TODO */}
                        </Table.HeaderCell>
                      ) : (
                        <>
                          <Table.HeaderCell textAlign="center" className={style.minWidth} content={_(".problem_table.status")} />
                          <Table.HeaderCell content={_(".problem_table.problem")} />
                          <Table.HeaderCell textAlign="center" className={style.minWidth} content={_(".problem_table.statistics")} />
                        </>
                      )
                    }
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {
                    props.problems.map(p => {
                      const problemAlias = contest.problems.find(({ problemId }) => problemId === p.id).alias;

                      const status = <>{ /* TODO */}</>;
                      const problem = (
                        <Link href={`p/${encodeURIComponent(problemAlias)}`}>
                          {problemAlias}.&nbsp;{getProblemDisplayName(p, _, "titleOnly")}
                        </Link>
                      );
                      const statistics = <>0 / 0 / 0{ /* TODO */}</>;

                      return (
                        <Table.Row key={p.id}>
                          {
                            isMobile ? (
                              <Table.Cell>
                                { /* TODO */}
                              </Table.Cell>
                            ) : (
                              <>
                                <Table.Cell textAlign="center" className={style.minWidth} content={status} />
                                <Table.Cell content={problem} />
                                <Table.Cell textAlign="center" className={style.minWidth} content={statistics} />
                              </>
                            )
                          }
                        </Table.Row>
                      )
                    })
                  }
                </Table.Body>
              </Table>
            )
          }
          <ContestAnnouncementsView
            contest={props.contest}
            announcements={props.announcements}
            announcementsSubscription={props.announcementsSubscription}
            status={status}
            role={role}
          />
          <ContestIssuesView contest={props.contest} issues={props.issues} issuesSubscription={props.issuesSubscription} status={status} role={role} />
        </div>
        <div className={style.right}>
          <Segment className={style.countdownSegment} color={status === "Pending" ? "orange" : status === "Running" ? "green" : "blue"}>
            <Header textAlign="center" size="medium" content={_(`.countdown.status.${status}`)} />
            <div className={style.countdown}>
              <Countdown
                date={status === "Pending" ? startTime : participantEndTime}
                renderer={p => (
                  <>
                    {(p.days * 24 + p.hours).toString().padStart(2, "0")}:
                    {(p.minutes).toString().padStart(2, "0")}:
                    {(p.seconds).toString().padStart(2, "0")}
                  </>
                )}
              />
            </div>
          </Segment>
          <ButtonGroup fluid className={style.buttonGroup}>
            <Button color="orange" content={_(".right.button_ranklist")} />
            <Button color="teal" content={_(".right.button_submissions")} />
          </ButtonGroup>
        </div>
      </div>
    </>
  );
};

export default defineRoute(async request => {
  const id = Number(request.params.id) || 0;
  const realRanklist = "realRanklist" in request.query;

  const { requestError, response } = await api.contest.getContest({ contestId: id, realRanklist, locale: appState.locale });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`contest_view.errors.${response.error}`));

  return <ContestViewPage {...response} />
});

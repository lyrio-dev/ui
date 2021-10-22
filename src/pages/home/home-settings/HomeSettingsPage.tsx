import React, { useEffect, useState } from "react";
import { Button, Checkbox, Dropdown, Header, Icon, Popup, Table } from "semantic-ui-react";
import yaml from "js-yaml";

import style from "./HomeSettingsPage.module.less";

import api from "@/api";
import { defineRoute, RouteError } from "@/AppRouter";
import { makeToBeLocalizedText } from "@/locales";
import { Link, useAsyncCallbackPending, useConfirmNavigation, useLocalizer } from "@/utils/hooks";
import { LocalizeTab } from "@/components/LocalizeTab";
import { appState } from "@/appState";
import { Locale } from "@/interfaces/Locale";
import { DiscussionEditor } from "@/pages/discussion/view/DiscussionViewPage";
import { EmojiRenderer } from "@/components/EmojiRenderer";
import { getDiscussionDisplayTitle, getDiscussionUrl } from "@/pages/discussion/utils";
import formatDateTime from "@/utils/formatDateTime";
import { DiscussionSearch } from "@/components/DiscussionSearch";
import LazyCodeEditor from "@/components/LazyCodeEditor";
import toast from "@/utils/toast";

async function fetchData() {
  const { requestError, response } = await api.homepage.getHomepageSettings();

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error)
    throw new RouteError(makeToBeLocalizedText(`home_settings.errors.${response.error}`), {
      showRefresh: true,
      showBack: true
    });

  return response;
}

type HomeSettingsPageProps = Omit<ApiTypes.GetHomepageSettingsResponseDto, "error">;

let HomeSettingsPage: React.FC<HomeSettingsPageProps> = props => {
  const _ = useLocalizer("home_settings");

  useEffect(() => {
    appState.enterNewPage(_(".title"), null, false);
  }, [appState.locale]);

  const [modified, setModified] = useConfirmNavigation();

  const [noticeEnabled, setNoticeEnabled] = useState(props.settings.notice.enabled);
  const [notice, setNotice] = useState(
    () =>
      (Object.keys(props.settings.notice.contents).length === 0
        ? { [appState.locale]: "" }
        : props.settings.notice.contents) as Record<Locale, string>
  );

  const [annnouncements, setAnnnouncements] = useState(
    () =>
      (Object.keys(props.settings.annnouncements.items).length === 0
        ? { [appState.locale]: [] }
        : Object.fromEntries(
            Object.entries(props.settings.annnouncements.items).map(([locale, ids]: [Locale, number[]]) => [
              locale,
              ids.map(id => props.annnouncementDiscussions.find(discussion => discussion.id === id))
            ])
          )) as Record<Locale, ApiTypes.DiscussionMetaDto[]>
  );

  const [hitokotoConfig, setHitokotoConfig] = useState(() => yaml.dump(props.settings.hitokoto));
  const [countdownConfig, setCountdownConfig] = useState(() => yaml.dump(props.settings.countdown));
  const [friendLinksConfig, setFriendLinksConfig] = useState(() => yaml.dump(props.settings.friendLinks));

  const [pending, onSubmit] = useAsyncCallbackPending(async () => {
    const hitokoto = yaml.load(hitokotoConfig) as any;
    const countdown = yaml.load(countdownConfig) as any;
    const friendLinks = yaml.load(friendLinksConfig) as any;
    const annnouncementIds = Object.fromEntries(
      Object.entries(annnouncements).map(([locale, discussions]) => [locale, discussions.map(({ id }) => id)])
    );

    const { requestError, response } = await api.homepage.updateHomepageSettings({
      settings: {
        notice: {
          enabled: noticeEnabled,
          contents: notice
        },
        annnouncements: {
          items: annnouncementIds
        },
        hitokoto,
        countdown,
        friendLinks
      }
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`, { id: response.errorDiscussionId }));
    else {
      setModified(false);
      toast.success(_(".success"));
    }
  });

  return (
    <>
      <div className={style.headerWrapper}>
        <Header as="h1" icon="setting" content={_(".header")} className="withIcon" />
        <Button loading={pending} primary content={_(".submit")} onClick={onSubmit} />
      </div>
      <Header
        className={style.subHeader}
        as="h3"
        content={
          <>
            {_(".notice.header")}
            <Checkbox toggle checked={noticeEnabled} onChange={(e, { checked }) => setNoticeEnabled(checked)} />
          </>
        }
      />
      <LocalizeTab
        className={style.noticeLocalizeTab + (!noticeEnabled ? " " + style.disabled : "")}
        localizedContents={notice}
        setLocalizedContents={setNotice}
        setModified={setModified}
        item={(locale, content, setDefaultLocale, deleteLocale) => (
          <div className={style.noticeTab}>
            <div className={style.buttons}>
              {setDefaultLocale && <Button content={_(".set_default_locale")} onClick={setDefaultLocale} />}
              {deleteLocale && (
                <Popup
                  trigger={<Button negative content={_(".delete_locale")} />}
                  content={<Button negative content={_(".confirm_delete_locale")} onClick={deleteLocale} />}
                  on="click"
                  position="top center"
                />
              )}
            </div>
            <div>
              <DiscussionEditor
                type="RawEditor"
                content={content}
                onChangeContent={content => {
                  setModified(true);
                  setNotice(notice => ({
                    ...notice,
                    [locale]: content
                  }));
                }}
                placeholder={_(".notice.placeholder")}
              />
            </div>
          </div>
        )}
        defaultLocalizedContent=""
      />
      <Header as="h3" content={_(".annnouncements.header")} />
      <LocalizeTab
        localizedContents={annnouncements}
        setLocalizedContents={setAnnnouncements}
        setModified={setModified}
        item={(locale, content, setDefaultLocale, deleteLocale) => (
          <>
            <Table unstackable className={style.table} basic>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1} className={style.noWrap} textAlign="center">
                    #
                  </Table.HeaderCell>
                  <Table.HeaderCell>{_(".annnouncements.title")}</Table.HeaderCell>
                  <Table.HeaderCell width={1} className={style.noWrap} textAlign="center">
                    {_(".annnouncements.date")}
                  </Table.HeaderCell>
                  <Table.HeaderCell width={1} className={style.noWrap} textAlign="center">
                    {_(".annnouncements.operations")}
                  </Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {content.map(annnouncement => (
                  <Table.Row key={annnouncement.id}>
                    <Table.Cell textAlign="center" className={style.noWrap}>
                      {annnouncement.id}
                    </Table.Cell>
                    <Table.Cell>
                      <EmojiRenderer>
                        <Link href={getDiscussionUrl(annnouncement)} target="_blank">
                          {getDiscussionDisplayTitle(annnouncement.title, _)}
                        </Link>
                      </EmojiRenderer>
                    </Table.Cell>
                    <Table.Cell width={1} className={style.noWrap}>
                      {formatDateTime(annnouncement.publishTime, true)[1]}
                    </Table.Cell>
                    <Table.Cell className={style.noWrap} textAlign="center">
                      <Icon
                        className={style.operation}
                        name="delete"
                        onClick={() => {
                          setModified(true);
                          setAnnnouncements(annnouncements => ({
                            ...annnouncements,
                            [locale]: content.filter(x => x.id !== annnouncement.id)
                          }));
                        }}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan={4}>
                    <div className={style.footer}>
                      <Header size="tiny">{_(".annnouncements.add")}</Header>
                      <DiscussionSearch
                        onResultSelect={({ meta }) => {
                          setModified(true);
                          setAnnnouncements(annnouncements =>
                            content.some(x => x.id === meta.id)
                              ? annnouncements
                              : {
                                  ...annnouncements,
                                  [locale]: [...content, meta].sort((a, b) => b.id - a.id)
                                }
                          );
                        }}
                      />
                      <div className={style.space} />
                      {setDefaultLocale && <Button content={_(".set_default_locale")} onClick={setDefaultLocale} />}
                      {deleteLocale && (
                        <Popup
                          trigger={<Button negative content={_(".delete_locale")} />}
                          content={<Button negative content={_(".confirm_delete_locale")} onClick={deleteLocale} />}
                          on="click"
                          position="top center"
                        />
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </>
        )}
        defaultLocalizedContent={[]}
      />
      <Header as="h3" content={_(".hitokoto")} />
      <LazyCodeEditor
        className={style.configEditor}
        language="yaml"
        value={hitokotoConfig}
        onChange={value => setHitokotoConfig(value)}
      />
      <Header as="h3" content={_(".countdown")} />
      <LazyCodeEditor
        className={style.configEditor}
        language="yaml"
        value={countdownConfig}
        onChange={value => setCountdownConfig(value)}
      />
      <Header as="h3" content={_(".friend_links")} />
      <LazyCodeEditor
        className={style.configEditor}
        language="yaml"
        value={friendLinksConfig}
        onChange={value => setFriendLinksConfig(value)}
      />
      <div className={style.bottomSubmitWrapper}>
        <Button loading={pending} primary content={_(".submit")} onClick={onSubmit} />
      </div>
    </>
  );
};

export default defineRoute(async request => <HomeSettingsPage {...await fetchData()} />);

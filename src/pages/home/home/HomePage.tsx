import React, { useEffect, useState } from "react";
import { Grid, Header, Icon, List, Placeholder, Segment, Table } from "semantic-ui-react";
import { observer } from "mobx-react";
import Countdown from "react-countdown";

import style from "./HomePage.module.less";

import { appState } from "@/appState";
import { Link, useLocalizer, useNavigationChecked, useScreenWidthWithin } from "@/utils/hooks";
import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import MarkdownContent from "@/markdown/MarkdownContent";
import { getDiscussionDisplayTitle, getDiscussionUrl } from "@/pages/discussion/utils";
import formatDateTime from "@/utils/formatDateTime";
import { EmojiRenderer } from "@/components/EmojiRenderer";
import { getProblemDisplayName, getProblemUrl } from "@/pages/problem/utils";
import TimeAgo from "@/components/TimeAgo";
import ProblemSearch from "@/components/ProblemSearch";
import UserLink from "@/components/UserLink";
import { StatusIcon } from "@/components/StatusText";

async function fetchData() {
  const { requestError, response } = await api.homepage.getHomepage({
    locale: appState.locale
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });

  return response;
}

interface Hitokoto {
  id: string;
  hitokoto: string;
  from: string;
}

async function fetchHitokoto(apiUrl: string) {
  try {
    const response = await fetch(apiUrl);
    return (await response.json()) as Hitokoto;
  } catch (e) {
    console.log("Error loading hitokoto:", e);
    return null;
  }
}

type HomePageProps = ApiTypes.GetHomepageResponseDto;

let HomePage: React.FC<HomePageProps> = props => {
  const _ = useLocalizer("home");
  const navigation = useNavigationChecked();

  useEffect(() => {
    appState.enterNewPage(_(".title"), "home");
  }, [appState.locale]);

  const [hitokotoError, setHitokotoError] = useState(false);
  const [hitokotoResult, setHitokotoResult] = useState<Hitokoto>(null);
  useEffect(() => {
    if (props.hitokoto) loadHitokoto(true);
  }, []);

  function loadHitokoto(firstLoad: boolean) {
    // Already loading
    if (!hitokotoResult && !firstLoad) return;

    setHitokotoError(false);
    setHitokotoResult(null);
    fetchHitokoto(props.hitokoto.apiUrl).then(result => {
      if (result) setHitokotoResult(result);
      else setHitokotoError(true);
    });
  }

  const getNotice = () =>
    props.notice && (
      <Segment className={style.segment} color="pink">
        <MarkdownContent placeholderLines={7} content={props.notice} />
      </Segment>
    );

  const getAnnnouncements = () => (
    <>
      <Header
        className={style.header}
        as="h4"
        block
        icon="bullhorn"
        content={_(".annnouncements.header")}
        attached="top"
      />
      <Segment className={style.segment} attached="bottom" placeholder={props.annnouncements.length === 0}>
        {props.annnouncements.length > 0 ? (
          <Table unstackable className={style.table} basic="very">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{_(".annnouncements.title")}</Table.HeaderCell>
                <Table.HeaderCell width={1} className={style.noWrap}>
                  {_(".annnouncements.date")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {props.annnouncements.map(annnouncement => (
                <Table.Row key={annnouncement.id}>
                  <Table.Cell>
                    <EmojiRenderer>
                      <Link href={getDiscussionUrl(annnouncement)}>
                        {getDiscussionDisplayTitle(annnouncement.title, _)}
                      </Link>
                    </EmojiRenderer>
                  </Table.Cell>
                  <Table.Cell width={1} className={style.noWrap}>
                    {formatDateTime(annnouncement.publishTime, true)[1]}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Header icon>
            <Icon name="bullhorn" />
            {_(".annnouncements.no_annnouncements")}
          </Header>
        )}
      </Segment>
    </>
  );

  const getLatestProblems = (inMainView: boolean) => (
    <>
      <Header
        className={style.header}
        as="h4"
        block
        icon="book"
        content={_(".latest_problems.header")}
        attached="top"
      />
      <Segment
        className={style.segment}
        textAlign="center"
        attached="bottom"
        placeholder={props.latestUpdatedProblems.length === 0}
      >
        {props.latestUpdatedProblems.length > 0 ? (
          <Table unstackable className={style.table} basic="very">
            <Table.Header>
              <Table.Row>
                {appState.currentUser && (
                  <Table.HeaderCell width={1} textAlign="center" className={style.noWrap}>
                    {_(".latest_problems.status")}
                  </Table.HeaderCell>
                )}
                <Table.HeaderCell textAlign={inMainView ? "left" : "center"}>
                  {_(".latest_problems.problem")}
                </Table.HeaderCell>
                <Table.HeaderCell width={1} textAlign="center" className={style.noWrap}>
                  {_(".latest_problems.updated_time")}
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {props.latestUpdatedProblems.map(({ meta, title, submission }) => (
                <Table.Row key={meta.id}>
                  {appState.currentUser && (
                    <Table.Cell textAlign="center">
                      {submission && (
                        <Link href={`/s/${submission.id}`}>
                          <StatusIcon status={submission.status} noMarginRight />
                        </Link>
                      )}
                    </Table.Cell>
                  )}
                  <Table.Cell textAlign={inMainView ? "left" : "center"}>
                    <EmojiRenderer>
                      <Link href={getProblemUrl(meta)}>{getProblemDisplayName(meta, title, _, "all")}</Link>
                    </EmojiRenderer>
                  </Table.Cell>
                  <Table.Cell className={style.latestProblemsDate + " " + style.noWrap} textAlign="center">
                    <TimeAgo time={new Date(meta.publicTime)} dateOnly />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Header icon>
            <Icon name="file" />
            {_(".latest_problems.no_problems")}
          </Header>
        )}
      </Segment>
    </>
  );

  const getHitokoto = () =>
    props.hitokoto && (
      <>
        <Header
          className={style.header + " " + style.hitokoto}
          as="h4"
          block
          icon="comment alternate"
          content={
            <>
              {props.hitokoto?.customTitle || _(".hitokoto.header")}
              <Icon onClick={() => loadHitokoto(false)} name="redo" title={_(".hitokoto.refresh")} />
            </>
          }
          attached="top"
        />
        <Segment className={style.segment} textAlign="center" attached="bottom">
          {hitokotoError ? (
            _(".hitokoto.error")
          ) : hitokotoResult ? (
            <EmojiRenderer>
              <div>
                {hitokotoResult.hitokoto}
                <div className={style.hitokotoFrom}>{hitokotoResult.from}</div>
              </div>
            </EmojiRenderer>
          ) : (
            <Placeholder>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder>
          )}
        </Segment>
      </>
    );

  const getCountdown = () =>
    props.countdown &&
    Object.keys(props.countdown.items).length > 0 && (
      <>
        <Header
          className={style.header}
          as="h4"
          block
          icon="calendar alternate"
          content={_(".countdown.header")}
          attached="top"
        />
        <Segment className={style.segment} attached="bottom">
          {Object.entries(props.countdown.items).map(([event, time], i) => (
            <div key={i} className={style.countdown}>
              <EmojiRenderer>
                <Countdown
                  date={new Date(time as string)}
                  renderer={p => {
                    if (p.completed)
                      return (
                        <>
                          {_(".countdown.completed_before_event")}
                          <span className={style.event}>{event}</span>
                          {_(".countdown.completed_after_event")}
                        </>
                      );
                    else {
                      let time: string;
                      let timeIsDays = false;
                      if (p.days > 0) {
                        time = p.days.toString();
                        timeIsDays = true;
                      } else if (p.hours > 0) {
                        time = `${p.formatted.hours}:${p.formatted.minutes}:${p.formatted.seconds}`;
                      } else {
                        time = `${p.formatted.minutes}:${p.formatted.seconds}`;
                      }

                      return _(".countdown.display_time_first") === "1" ? (
                        <>
                          {_(".countdown.before_time")}
                          <span className={style.time}>{time}</span>
                          {_(timeIsDays ? ".countdown.after_days_before_event" : ".countdown.after_time_before_event")}
                          <span className={style.event}>{event}</span>
                          {_(".countdown.after_event")}
                        </>
                      ) : (
                        <>
                          {_(".countdown.before_event")}
                          <span className={style.event}>{event}</span>
                          {_(".countdown.after_event_before_time")}
                          <span className={style.time}>{time}</span>
                          {_(timeIsDays ? ".countdown.after_days" : ".countdown.after_time")}
                        </>
                      );
                    }
                  }}
                />
              </EmojiRenderer>
            </div>
          ))}
        </Segment>
      </>
    );

  const getProblemSearch = () => (
    <>
      <Header className={style.header} as="h4" block icon="search" content={_(".search_problem")} attached="top" />
      <Segment className={style.segment + " " + style.search} attached="bottom">
        <ProblemSearch
          className={style.search}
          onResultSelect={({ meta }) => navigation.navigate(getProblemUrl(meta))}
          onEnterPress={searchKeyword => navigation.navigate({ pathname: "/p", query: { keyword: searchKeyword } })}
        />
      </Segment>
    </>
  );

  const getTopUsers = (inMainView: boolean) => (
    <>
      <Header className={style.header} as="h4" block icon="user" content={_(".top_users.header")} attached="top" />
      <Segment className={style.segment} textAlign="center" attached="bottom" placeholder={props.topUsers.length === 0}>
        {props.topUsers.length > 0 ? (
          <Table unstackable className={style.table} basic="very" textAlign="center" compact={!inMainView}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell width={1} className={style.noWrap}>
                  #
                </Table.HeaderCell>
                <Table.HeaderCell>{_(".top_users.username")}</Table.HeaderCell>
                {inMainView ? (
                  <Table.HeaderCell>{_(".top_users.bio")}</Table.HeaderCell>
                ) : (
                  <Table.HeaderCell width={1} className={style.noWrap}>
                    {appState.serverPreference.misc.sortUserByRating
                      ? _(".top_users.rating")
                      : _(".top_users.accepted_problem_count")}
                  </Table.HeaderCell>
                )}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {props.topUsers.map((user, i) => (
                <Table.Row key={user.id}>
                  <Table.Cell>{i + 1}</Table.Cell>
                  <Table.Cell>
                    <UserLink user={user} />
                  </Table.Cell>
                  {inMainView ? (
                    <Table.Cell className={style.columnBio}>
                      {appState.serverPreference.misc.renderMarkdownInUserBio ? (
                        <MarkdownContent content={user.bio} dontUseContentFont placeholderLines={1} />
                      ) : (
                        <EmojiRenderer>
                          <div>{user.bio}</div>
                        </EmojiRenderer>
                      )}
                    </Table.Cell>
                  ) : (
                    <Table.Cell>
                      {appState.serverPreference.misc.sortUserByRating ? user.rating : user.acceptedProblemCount}
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Header icon>
            <Icon name="user" />
            {_(".top_users.no_users")}
          </Header>
        )}
      </Segment>
    </>
  );

  const getFriendLinks = () =>
    props.friendLinks &&
    Object.keys(props.friendLinks.links).length > 0 && (
      <>
        <Header className={style.header} as="h4" block icon="linkify" content={_(".friend_links")} attached="top" />
        <Segment className={style.segment} attached="bottom" placeholder={props.topUsers.length === 0}>
          <List bulleted>
            {Object.entries(props.friendLinks.links).map(([title, url], i) => (
              <List.Item key={i}>
                <EmojiRenderer>
                  <a href={url as string} target="_blank" rel="noreferrer noopener">
                    {title}
                  </a>
                </EmojiRenderer>
              </List.Item>
            ))}
          </List>
        </Segment>
      </>
    );

  const isNarrowScreen = useScreenWidthWithin(0, 1024);

  return (
    <>
      {isNarrowScreen ? (
        <>
          {getNotice()}
          {getAnnnouncements()}
          {getHitokoto()}
          {getProblemSearch()}
          {appState.serverPreference.misc.homepageUserListOnMainView ? getTopUsers(false) : getLatestProblems(true)}
          {getCountdown()}
          {appState.serverPreference.misc.homepageUserListOnMainView ? getLatestProblems(true) : getTopUsers(false)}
          {getFriendLinks()}
        </>
      ) : (
        <Grid>
          <Grid.Column width={11}>
            {getNotice()}
            {getAnnnouncements()}
            {appState.serverPreference.misc.homepageUserListOnMainView ? getTopUsers(true) : getLatestProblems(true)}
          </Grid.Column>
          <Grid.Column width={5}>
            {getHitokoto()}
            {getCountdown()}
            {getProblemSearch()}
            {appState.serverPreference.misc.homepageUserListOnMainView ? getLatestProblems(false) : getTopUsers(false)}
            {getFriendLinks()}
          </Grid.Column>
        </Grid>
      )}
    </>
  );
};

HomePage = observer(HomePage);

export default defineRoute(async request => {
  const dataPromise: ReturnType<typeof fetchData> = fetchData();

  return <HomePage {...await dataPromise} />;
});

import React, { useEffect } from "react";
import { Grid, Header, Button, List, Icon, Segment, Popup, Divider } from "semantic-ui-react";
import { observer } from "mobx-react";
import dayjs from "dayjs";

import style from "./UserPage.module.less";

import { appState } from "@/appState";
import api from "@/api";
import { useLocalizer, useScreenWidthWithin, Link } from "@/utils/hooks";
import fixChineseSpace from "@/utils/fixChineseSpace";
import UserAvatar from "@/components/UserAvatar";
import { defineRoute, RouteError } from "@/AppRouter";
import { isValidUsername } from "@/utils/validators";
import { makeToBeLocalizedText } from "@/locales";
import { EmojiRenderer } from "@/components/EmojiRenderer";
import MarkdownContent from "@/markdown/MarkdownContent";

function getTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

async function fetchData(query: { userId?: number; username?: string }): Promise<[Date, Required<typeof response>]> {
  const now = new Date();
  const { requestError, response } = await api.user.getUserDetail({
    ...query,
    timezone: getTimeZone(),
    now: now.toISOString()
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`user.error.${response.error}`));

  return [now, response as Required<typeof response>];
}

interface SubwayGraphProps {
  username: string;
  now: Date;
  data: number[];
}

const SubwayGraph: React.FC<SubwayGraphProps> = props => {
  const _ = useLocalizer("user");

  const now = dayjs(props.now).startOf("day");

  const weeks = 53;

  // A week starts from Monday
  const weekStart = Number(_(".subway_graph.start_of_week")) || 1;

  // If the last column is NOT a full week, the later at most 6 days' blocks will be omitted
  const omittedBlockCount = (((7 - (now.day() - weekStart + 1)) % 7) + 7) % 7;

  // The earliest x days' data is discarded
  const data = props.data.slice(props.data.length - (weeks * 7 - omittedBlockCount));

  const dataOfWeek = [...new Array(weeks).keys()].map(i => data.slice(i * 7, (i + 1) * 7));

  const startDate = now.subtract(weeks * 7 - omittedBlockCount - 1, "day");
  const startDateOfWeek = [...new Array(weeks).keys()].map(i => startDate.add(i * 7, "day"));

  // The month label for each week is the month of the first day of the week
  const monthOfWeek = startDateOfWeek.map(date => date.month() + 1);

  const getLevel = (count: number) => [1, 10, 20, 25, Infinity].findIndex(x => count < x);

  return (
    <Segment className={style.subwayGraphSegment}>
      <div className={style.graphWrapper}>
        <div className={style.graph}>
          <div className={style.weeks}>
            <div />
            {[...new Array(7).keys()].map(i => (
              <div key={i} className={style.label}>
                {_(`.subway_graph.week.${(i + weekStart) % 7 || 7}`)}
              </div>
            ))}
          </div>
          {dataOfWeek.map((weekData, i) => (
            <div key={i}>
              <div className={style.label}>
                {
                  // If the first month has too less weeks (less than 3), omit its month label
                  // since the space is not enough
                  (i === 0 ? monthOfWeek[2] == monthOfWeek[0] : monthOfWeek[i] != monthOfWeek[i - 1]) &&
                    _(`.subway_graph.month.${monthOfWeek[i]}`)
                }
              </div>
              {weekData.map((dayData, j) => (
                <div key={j} data-level={getLevel(dayData)}>
                  <Popup
                    trigger={<div />}
                    content={
                      <span className={style.subwayGraphPopup}>
                        <span className={style.submissions}>
                          {dayData
                            ? _(dayData === 1 ? ".subway_graph.popup.submission" : ".subway_graph.popup.submissions", {
                                count: dayData.toString()
                              })
                            : _(".subway_graph.popup.no_submissions")}
                        </span>
                        <span className={style.date}>{_.formatDate(startDateOfWeek[i].add(j, "day").toDate())}</span>
                      </span>
                    }
                    size="small"
                    inverted
                    on="hover"
                    position="top center"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className={style.footer}>
          <Link
            className={style.link}
            href={{
              pathname: "/s",
              query: {
                submitter: props.username
              }
            }}
          >
            <Icon name="search" />
            {_(".subway_graph.link")}
          </Link>
          <div className={style.legend}>
            <span>{_(".subway_graph.legend.less")}</span>
            <div data-level="0">
              <div />
            </div>
            <div data-level="1">
              <div />
            </div>
            <div data-level="2">
              <div />
            </div>
            <div data-level="3">
              <div />
            </div>
            <div data-level="4">
              <div />
            </div>
            <span>{_(".subway_graph.legend.more")}</span>
          </div>
        </div>
      </div>
    </Segment>
  );
};

type UserPageProps = ApiTypes.GetUserDetailResponseDto & {
  now: Date;
};

let UserPage: React.FC<UserPageProps> = props => {
  const _ = useLocalizer("user");

  useEffect(() => {
    appState.enterNewPage(`${props.meta.username}`, "members");
  }, [appState.locale, props.meta]);

  const isMobile = useScreenWidthWithin(0, 768);

  const avatar = (
    <div className={style.avatar}>
      <div>
        <UserAvatar userAvatar={props.meta.avatar} imageSize={260} />
      </div>
    </div>
  );
  const meta = (
    <>
      {props.meta.nickname ? (
        <EmojiRenderer>
          <Header as="h1" className={style.nickname} content={props.meta.nickname} />
        </EmojiRenderer>
      ) : null}
      <div className={style.username}>{props.meta.username}</div>
      {props.meta.bio && (
        <EmojiRenderer>
          <p className={style.bio}>
            {appState.serverPreference.misc.renderMarkdownInUserBio ? (
              <MarkdownContent content={props.meta.bio} dontUseContentFont />
            ) : (
              props.meta.bio
            )}
          </p>
        </EmojiRenderer>
      )}
    </>
  );

  const card = (
    <>
      {!isMobile ? (
        <>
          {avatar}
          {meta}
        </>
      ) : (
        <Grid>
          <Grid.Column className={style.cardSide + " " + style.cardSideAvatar} width={5}>
            {avatar}
          </Grid.Column>
          <Grid.Column className={style.cardSide + " " + style.cardSideMeta} width={11}>
            <div>{meta}</div>
          </Grid.Column>
        </Grid>
      )}
      {props.hasPrivilege ? (
        <Button className={style.editProfileButton} fluid content={_(".edit_profile")} as={Link} href="edit/profile" />
      ) : (
        !isMobile && <Divider className={style.editProfileButton} />
      )}
      <List className={style.informationList}>
        <List.Item className={style.item}>
          <div className={style.iconWrapper}>
            <Icon name="time" />
          </div>
          <span title={""}>
            {_(".joined")}
            {fixChineseSpace(
              _.formatDate(props.meta.registrationTime, { year: "numeric", month: "long", day: "numeric" })
            )}
          </span>
        </List.Item>
        {props.information.organization && (
          <List.Item className={style.item}>
            <div className={style.iconWrapper}>
              <Icon name="users" />
            </div>
            <span title={props.information.organization}>{props.information.organization}</span>
          </List.Item>
        )}
        {props.information.location && (
          <List.Item className={style.item}>
            <div className={style.iconWrapper}>
              <Icon name="map marker alternate" />
            </div>
            <span title={props.information.location}>{props.information.location}</span>
          </List.Item>
        )}
        {props.information.url && (
          <List.Item className={style.item}>
            <div className={style.iconWrapper}>
              <Icon name="linkify" />
            </div>
            <a
              href={
                /^https?:\/\//i.test(props.information.url) ? props.information.url : "http://" + props.information.url
              }
              title={props.information.url}
              target="_blank"
              rel="noreferrer noopener"
            >
              {props.information.url}
            </a>
          </List.Item>
        )}
      </List>
      <div className={style.socialIcons}>
        {props.meta.email && (
          <a
            className={style.socialIcon}
            href={`mailto:${props.meta.email}`}
            title={_(".social.email")}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="mail" />
          </a>
        )}
        {props.information.qq && (
          <a
            className={style.socialIcon}
            href={`https://wpa.qq.com/msgrd?V=3&Uin=${props.information.qq}`}
            title={_(".social.qq")}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="qq" />
          </a>
        )}
        {props.information.telegram && (
          <a
            className={style.socialIcon}
            href={`https://t.me/${props.information.telegram}`}
            title={_(".social.telegram")}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="telegram" />
          </a>
        )}
        {props.information.github && (
          <a
            className={style.socialIcon}
            href={`https://github.com/${props.information.github}`}
            title={_(".social.github")}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Icon name="github" />
          </a>
        )}
      </div>
    </>
  );

  const statisticsItems = [
    <div className={style.item}>
      <div className={style.iconWrapper}>
        <Icon name="checkmark" />
      </div>
      <span className={style.key}>{_(".statictics.ac_count")}</span>
      <span className={style.value}>{props.meta.acceptedProblemCount}</span>
    </div>,
    <div className={style.item}>
      <div className={style.iconWrapper}>
        <Icon name="calendar" />
      </div>
      <span className={style.key}>{_(".statictics.contest_take_part_count")}</span>
      <span className={style.value}>{0}</span>
    </div>,
    <div className={style.item}>
      <div className={style.iconWrapper}>
        <Icon name="star" />
      </div>
      <span className={style.key}>{_(".statictics.rating")}</span>
      <span className={style.value}>{props.meta.rating}</span>
    </div>,
    <div className={style.item}>
      <div className={style.iconWrapper}>
        <Icon name="signal" />
      </div>
      <span className={style.key}>{_(".statictics.rank")}</span>
      <span className={style.value}>{props.rank}</span>
    </div>
  ];
  const contents = (
    <>
      {!isMobile && <SubwayGraph username={props.meta.username} now={props.now} data={props.submissionCountPerDay} />}
      {!isMobile ? (
        <Segment attached="top">
          <div className={style.statictics}>
            {statisticsItems[0]}
            {statisticsItems[1]}
            {statisticsItems[2]}
            {statisticsItems[3]}
          </div>
        </Segment>
      ) : (
        <>
          <Segment attached="top" className={style.firstStatisticsSegment}>
            <div className={style.statictics}>
              {statisticsItems[0]}
              {statisticsItems[1]}
            </div>
          </Segment>
          <Segment attached>
            <div className={style.statictics}>
              {statisticsItems[2]}
              {statisticsItems[3]}
            </div>
          </Segment>
        </>
      )}
      <Segment className={style.ratingSegment} attached="bottom">
        <Segment placeholder className={style.placeholder}>
          Rating Graph
        </Segment>
      </Segment>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          {card}
          {contents}
        </>
      ) : (
        <Grid>
          <Grid.Column width={4}>{card}</Grid.Column>
          <Grid.Column width={12}>{contents}</Grid.Column>
        </Grid>
      )}
    </>
  );
};

UserPage = observer(UserPage);

export default {
  byId: defineRoute(async request => {
    const userId = parseInt(request.params.userId) || 0;
    const [now, response] = await fetchData({ userId });

    return <UserPage now={now} {...response} />;
  }),
  byUsername: defineRoute(async request => {
    const username = decodeURIComponent(request.params.username);
    if (!isValidUsername(username)) throw new RouteError(makeToBeLocalizedText("user.error.NO_SUCH_USER"));
    const [now, response] = await fetchData({ username });

    return <UserPage now={now} {...response} />;
  })
};

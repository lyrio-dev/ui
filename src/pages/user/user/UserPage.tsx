import React, { useEffect, useState } from "react";
import { Grid, Image, Header, Card, Button, List, Icon, Segment, Popup } from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import { Link } from "react-navi";
import dayjs from "dayjs";

import style from "./UserPage.module.less";

import { appState } from "@/appState";
import { UserApi } from "@/api";
import toast from "@/utils/toast";
import { UserMeta } from "@/interfaces/UserMeta";
import { useIntlMessage } from "@/utils/hooks";
import getUserAvatar from "@/utils/getUserAvatar";

async function fetchData(userId: number): Promise<[Date, Required<typeof response>]> {
  const now = new Date();
  const { requestError, response } = await UserApi.getUserDetail({
    userId,
    timezoneOffset: -new Date().getTimezoneOffset() / 60,
    now: now.toISOString()
  });

  if (requestError) {
    toast.error(requestError);
    return [null, null];
  }

  return [now, response as Required<typeof response>];
}

interface SubwayGraphProps {
  username: string;
  now: Date;
  data: number[];
}

const SubwayGraph: React.FC<SubwayGraphProps> = props => {
  const _ = useIntlMessage();

  const now = dayjs(props.now).startOf("day");

  const weeks = 53;

  // A week starts from Monday
  const weekStart = 1;

  // If the last column is NOT a full week, the later at most 6 days' blocks will be omitted
  const omittedBlockCount = (((7 - (now.day() - weekStart + 1)) % 7) + 7) % 7;

  // The earlist x days' data is discarded
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
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <div className={style.label}>{_(`user.subway_graph.week.${i}`)}</div>
            ))}
          </div>
          {dataOfWeek.map((weekData, i) => (
            <div>
              <div className={style.label}>
                {// If the first month has too less weeks (less than 3), omit its month label
                // since the space is not enough
                (i === 0 ? monthOfWeek[2] == monthOfWeek[0] : monthOfWeek[i] != monthOfWeek[i - 1]) &&
                  _(`user.subway_graph.month.${monthOfWeek[i]}`)}
              </div>
              {weekData.map((dayData, j) => (
                <div data-level={getLevel(dayData)}>
                  <Popup
                    trigger={<div />}
                    content={
                      <span className={style.subwayGraphPopup}>
                        <span className={style.submissions}>
                          {dayData
                            ? _(
                                dayData === 1
                                  ? "user.subway_graph.popup.submission"
                                  : "user.subway_graph.popup.submissions",
                                { count: dayData.toString() }
                              )
                            : _("user.subway_graph.popup.no_submissions")}
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
              pathname: "/submissions",
              query: {
                submitter: props.username
              }
            }}
          >
            <Icon name="search" />
            {_("user.subway_graph.link")}
          </Link>
          <div className={style.legend}>
            <span>{_("user.subway_graph.legend.less")}</span>
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
            <span>{_("user.subway_graph.legend.more")}</span>
          </div>
        </div>
      </div>
    </Segment>
  );
};

interface UserPageProps {
  now: Date;
  meta: UserMeta;
  information: ApiTypes.UserInformationDto;
  submissionCountPerDay: number[];
  hasPrivilege: boolean;
}

let UserPage: React.FC<UserPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(`${props.meta.username}`, false);
  }, []);

  return (
    <>
      <Grid>
        <Grid.Column width={4}>
          <Image className={style.avatar} src={getUserAvatar(props.meta, 260 * 2)} />
          <Header as="h1" className={style.username} content={props.meta.username} />
          {props.meta.bio && <p className={style.bio}>{props.meta.bio}</p>}
          {props.hasPrivilege && (
            <Button
              className={style.editProfileButton}
              fluid
              content={_("user.edit_profile")}
              onClick={() => console.log("edit profile")}
            />
          )}
          <List className={style.informationList}>
            {props.information.organization && (
              <List.Item className={style.informationListItem}>
                <div className={style.informationListItemIconWrapper}>
                  <Icon name="users" />
                </div>
                <span title={props.information.organization}>{props.information.organization}</span>
              </List.Item>
            )}
            {props.information.location && (
              <List.Item className={style.informationListItem}>
                <div className={style.informationListItemIconWrapper}>
                  <Icon name="map marker alternate" />
                </div>
                <span title={props.information.location}>{props.information.location}</span>
              </List.Item>
            )}
            {props.information.url && (
              <List.Item className={style.informationListItem}>
                <div className={style.informationListItemIconWrapper}>
                  <Icon name="linkify" />
                </div>
                <a href={props.information.url} title={props.information.url}>
                  {props.information.url}
                </a>
              </List.Item>
            )}
          </List>
          <div className={style.socialIcons}>
            {props.meta.email && (
              <Link
                className={style.socialIcon}
                href={`mailto:${props.meta.email}`}
                title={_("user.social.email")}
                target="_blank"
              >
                <Icon name="mail" />
              </Link>
            )}
            {props.information.qq && (
              <Link
                className={style.socialIcon}
                href={`https://wpa.qq.com/msgrd?V=3&Uin=${props.information.qq}`}
                title={_("user.social.qq")}
                target="_blank"
              >
                <Icon name="qq" />
              </Link>
            )}
            {props.information.telegram && (
              <Link
                className={style.socialIcon}
                href={`https://t.me/${props.information.telegram}`}
                title={_("user.social.telegram")}
                target="_blank"
              >
                <Icon name="telegram" />
              </Link>
            )}
            {props.information.github && (
              <Link
                className={style.socialIcon}
                href={`https://github.com/${props.information.github}`}
                title={_("user.social.github")}
                target="_blank"
              >
                <Icon name="github" />
              </Link>
            )}
          </div>
          {
            // TODO: rating, submission & ac statistics
          }
        </Grid.Column>
        <Grid.Column width={12}>
          <SubwayGraph username={props.meta.username} now={props.now} data={props.submissionCountPerDay} />
        </Grid.Column>
      </Grid>
    </>
  );
};

UserPage = observer(UserPage);

export default route({
  async getView(request) {
    const userId = parseInt(request.params.userId) || 0;
    const [now, response] = await fetchData(userId);

    if (!response) {
      return null;
    }

    return <UserPage now={now} {...response} />;
  }
});

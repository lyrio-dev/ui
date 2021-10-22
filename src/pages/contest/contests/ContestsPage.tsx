import React, { useEffect } from "react";
import { Button, Header, Icon, Popup, Segment, Table } from "semantic-ui-react";
import dayjs from "dayjs";

import style from "./ContestsPage.module.less";

import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import { appState } from "@/appState";
import { Link, useAsyncCallbackPending, useLocalizer, useNavigationChecked, useScreenWidthWithin } from "@/utils/hooks";
import formatDateTime from "@/utils/formatDateTime";
import { getContestDisplayName, getContestUrl } from "../utils";
import IconLinkButton from "@/components/IconLinkButton";
import toast from "@/utils/toast";
import { Pagination } from "@/components/Pagination";

const CONTESTS_PER_PAGE = appState.serverPreference.pagination.contestList;

async function fetchData(currentPage: number) {
  const { requestError, response, date } = await api.contest.queryContests({
    locale: appState.locale,
    skipCount: (currentPage - 1) * CONTESTS_PER_PAGE,
    takeCount: CONTESTS_PER_PAGE
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });

  return { ...response, date };
}

function getContestDuration(contest: ApiTypes.ContestMetaDto) {
  const total = contest.participantDuration || dayjs(contest.endTime).diff(dayjs(contest.startTime), "s");
  const hours = String(Math.floor(total / 60 / 60));
  const minutes = String(Math.floor(total / 60) % 60);
  const seconds = String(total % 60);
  return (
    `${hours.length === 1 ? "0" : ""}${hours}:${minutes.length === 1 ? "0" : ""}${minutes}` +
    (seconds === "0" ? "" : `:${seconds.length === 1 ? "0" : ""}${seconds}`)
  );
}

interface ContestsPageProps extends ApiTypes.QueryContestsResponseDto {
  date: Date;
  currentPage: number;
}

const ContestsPage: React.FC<ContestsPageProps> = props => {
  const _ = useLocalizer("contests");
  const navigation = useNavigationChecked();

  useEffect(() => {
    appState.enterNewPage(_(".title"), "contests");
  }, [appState.locale]);

  const pastContests = props.contests.filter(c => props.date >= new Date(c.endTime));
  const currentOrUpcomingContests = props.contests.filter(c => props.date < new Date(c.endTime));

  const [, onRegister] = useAsyncCallbackPending(async (contest: ApiTypes.ContestMetaDto) => {
    const { requestError, response } = await api.contest.registerContest({
      contestId: contest.id
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      toast.success(_(".register_success"));
      await navigation.navigate(getContestUrl(contest));
    }
  });

  const loggedIn = !!appState.currentUser;
  const hasPrivilege = appState.currentUserHasPrivilege("ManageContest");

  const isNarrowScreen = useScreenWidthWithin(0, 1024);
  const isMobile = useScreenWidthWithin(0, 768);

  const createButton = hasPrivilege && !isMobile && (
    <Button as={Link} href="/c/new" content={_(".create")} icon="add" labelPosition="left" />
  );

  const getTable = (
    contests: ApiTypes.ContestMetaDto[],
    isPast: boolean,
    header: string,
    showCreateButton: boolean
  ) => (
    <>
      <Header size="medium" className={style.header + (isMobile ? " " + style.mobile : "")}>
        {header}
        {showCreateButton && createButton}
      </Header>
      <Table textAlign="center" unstackable compact={isMobile}>
        <Table.Header>
          {isMobile ? (
            <Table.Row>
              <Table.HeaderCell>
                <div className={style.mobileRow}>
                  <div>
                    <div>{_(".column_name")}</div>
                  </div>
                  <div>
                    <div>{_(".column_start_time")}</div>
                    <div>{_(".column_length")}</div>
                  </div>
                  <div>
                    <div>{loggedIn && _(".column_operations")}</div>
                    <div>{_(".column_participants")}</div>
                  </div>
                </div>
              </Table.HeaderCell>
            </Table.Row>
          ) : (
            <Table.Row>
              <Table.HeaderCell
                className={style.nowrap}
                textAlign="left"
                width={isNarrowScreen ? 6 : 8}
                content={_(".column_name")}
              />
              <Table.HeaderCell className={style.nowrap} content={_(".column_start_time")} />
              <Table.HeaderCell className={style.nowrap} content={_(".column_length")} />
              <Table.HeaderCell className={style.nowrap} content={_(".column_participants")} />
              {loggedIn && <Table.HeaderCell className={style.nowrap} content={_(".column_operations")} />}
            </Table.Row>
          )}
        </Table.Header>
        <Table.Body>
          {contests.map(c => {
            const columnName = <Link href={getContestUrl(c)}>{getContestDisplayName(c.name, _)}</Link>;
            const columnStartTime = formatDateTime(c.startTime)[1];
            const columnDuration = getContestDuration(c);
            const columnParticipants = (
              <Link className={style.participants} href={getContestUrl(c, "")}>
                <Icon className={style.icon} name="user" />
                <span className={style.mulSign}>✕</span>
                {props.participantCount[c.id] || 0}
              </Link>
            );
            const columnOperations = loggedIn && (
              <div>
                {props.registeredContests.includes(c.id) ? (
                  <IconLinkButton
                    className={style.operationRegistered}
                    icon="check"
                    text={_(".operation_registered")}
                  />
                ) : isPast ? (
                  <IconLinkButton className={style.operationEnded} icon="clock outline" text={_(".operation_ended")} disabled />
                ) : (
                  <Popup
                    trigger={
                      <IconLinkButton className={style.operationRegister} icon="add" text={_(".operation_register")} />
                    }
                    content={
                      <>
                        <p>{_(".register_confirm_message")}</p>
                        <Button content={_(".register_confirm")} primary onClick={() => onRegister(c)} />
                      </>
                    }
                    on="click"
                    position={isMobile ? "right center" : "left center"}
                  />
                )}
                {hasPrivilege && (
                  <IconLinkButton
                    className={style.operationEdit}
                    icon="edit"
                    text={_(".operation_edit")}
                    href={getContestUrl(c, "edit")}
                  />
                )}
              </div>
            );
            return isMobile ? (
              <Table.Row key={c.id}>
                <Table.Cell>
                  <div className={style.mobileRow}>
                    <div>
                      <div>
                        <b>{columnName}</b>
                      </div>
                    </div>
                    <div>
                      <div>{columnStartTime}</div>
                      <div>{columnDuration}</div>
                    </div>
                    <div>
                      <div className={style.linkButtonsMobile}>{loggedIn && columnOperations}</div>
                      <div>{columnParticipants}</div>
                    </div>
                  </div>
                </Table.Cell>
              </Table.Row>
            ) : (
              <Table.Row key={c.id}>
                <Table.Cell textAlign="left" width={isNarrowScreen ? 6 : 8} content={columnName} />
                <Table.Cell className={style.nowrap} content={columnStartTime} />
                <Table.Cell className={style.nowrap} content={columnDuration} />
                <Table.Cell className={style.nowrap} content={columnParticipants} />
                {loggedIn && (
                  <Table.Cell
                    className={style.nowrap + " " + style.linkButtons + (hasPrivilege ? " " + style.privileged : "")}
                    content={columnOperations}
                  />
                )}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );

  const getPagination = () =>
    props.count <= CONTESTS_PER_PAGE ? null : (
      <Pagination
        totalCount={props.count}
        currentPage={props.currentPage}
        itemsPerPage={CONTESTS_PER_PAGE}
        pageUrl={page => ({
          query: {
            page: page.toString()
          }
        })}
      />
    );

  return (
    <>
      {props.contests.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            <Icon name="file" />
            {_(".no_contests.message")}
          </Header>
          {appState.currentUserHasPrivilege("ManageContest") && (
            <Segment.Inline>
              <Button primary as={Link} href="/c/new">
                {_(".no_contests.create")}
              </Button>
            </Segment.Inline>
          )}
        </Segment>
      ) : (
        <>
          {currentOrUpcomingContests.length !== 0 && getTable(currentOrUpcomingContests, false, _(".current_or_upcoming_contests"), true)}
          {pastContests.length !== 0 &&
            getTable(pastContests, true, _(".past_contests"), currentOrUpcomingContests.length === 0)}
          <div className={style.pagination}>{getPagination()}</div>
        </>
      )}
    </>
  );
};

export default defineRoute(async request => {
  const currentPage = Number(request.query.page) || 1;
  return <ContestsPage currentPage={currentPage} {...await fetchData(currentPage)} />;
});

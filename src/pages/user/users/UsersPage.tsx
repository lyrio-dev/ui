import React, { useEffect } from "react";
import { Table, Icon, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useCurrentRoute } from "react-navi";
import { v4 as uuid } from "uuid";

import style from "./UsersPage.module.less";

import api from "@/api";
import { UserMeta } from "@/interfaces/UserMeta";
import { useLocalizer, useNavigationChecked, Link } from "@/utils/hooks";
import { appState } from "@/appState";
import { Pagination } from "@/components/Pagination";
import UserLink from "@/components/UserLink";
import UserSearch from "@/components/UserSearch";
import { defineRoute, RouteError } from "@/AppRouter";
import { makeToBeLocalizedText } from "@/locales";
import { EmojiRenderer } from "@/components/EmojiRenderer";
import MarkdownContent from "@/markdown/MarkdownContent";

const USERS_PER_PAGE = appState.serverPreference.pagination.userList;

enum SortBy {
  rating = "rating",
  acceptedProblemCount = "acceptedProblemCount"
}

async function fetchData(sortBy: SortBy, currentPage: number): Promise<[UserMeta[], number]> {
  const { requestError, response } = await api.user.getUserList({
    sortBy,
    skipCount: USERS_PER_PAGE * (currentPage - 1),
    takeCount: USERS_PER_PAGE
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });

  return [response.userMetas, response.count];
}

interface UsersPageProps {
  users: UserMeta[];
  sortBy: SortBy;
  currentPage: number;
  totalCount: number;
}

let UsersPage: React.FC<UsersPageProps> = props => {
  const _ = useLocalizer("users");
  const navigation = useNavigationChecked();
  const currentRoute = useCurrentRoute();

  useEffect(() => {
    appState.enterNewPage(_(".title"), "members");
  }, [appState.locale]);

  const scrollElement = document.documentElement;
  useEffect(() => {
    scrollElement.scrollTop = 0;
  }, [props.currentPage]);

  return (
    <>
      <div className={style.header}>
        <UserSearch onResultSelect={user => navigation.navigate(`/u/${user.username}`)} />
        {appState.currentUserHasPrivilege("ManageUserGroup") && (
          <div className={style.manageGroups}>
            <Button primary content={_(".manage_groups")} as={Link} href="/groups" />
          </div>
        )}
      </div>
      <Table unstackable basic="very" textAlign="center" className={style.table}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className={style.columnRank}>{_(".rank")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnUsername}>{_(".username")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnBio}>{_(".bio")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnAcceptedProblemCount}>
              {props.sortBy === SortBy.acceptedProblemCount ? (
                <>
                  {_(".accepted_problem_count")}
                  <Icon name="angle down" />
                </>
              ) : (
                <Link
                  className={style.link}
                  href={{
                    query: {
                      sortBy: SortBy.acceptedProblemCount
                    }
                  }}
                >
                  {_(".accepted_problem_count")}
                </Link>
              )}
            </Table.HeaderCell>
            <Table.HeaderCell className={style.columnRating}>
              {props.sortBy === SortBy.rating ? (
                <>
                  {_(".rating")}
                  <Icon name="angle down" />
                </>
              ) : (
                <Link
                  className={style.link}
                  href={{
                    query: {
                      sortBy: SortBy.rating
                    }
                  }}
                >
                  {_(".rating")}
                </Link>
              )}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {props.users.map((user, i) => (
            <Table.Row key={user.id}>
              <Table.Cell>
                <strong>{(props.currentPage - 1) * USERS_PER_PAGE + i + 1}</strong>
              </Table.Cell>
              <Table.Cell>
                <UserLink user={user} />
              </Table.Cell>
              <Table.Cell className={style.columnBio}>
                {appState.serverPreference.misc.renderMarkdownInUserBio ? (
                  <MarkdownContent content={user.bio} dontUseContentFont />
                ) : (
                  <EmojiRenderer>
                    <div>{user.bio}</div>
                  </EmojiRenderer>
                )}
              </Table.Cell>
              <Table.Cell>{user.acceptedProblemCount}</Table.Cell>
              <Table.Cell>{user.rating}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {props.totalCount <= USERS_PER_PAGE ? null : (
        <div className={style.pagination}>
          <Pagination
            totalCount={props.totalCount}
            currentPage={props.currentPage}
            itemsPerPage={USERS_PER_PAGE}
            pageUrl={page => ({
              query: {
                ...currentRoute.url.query,
                page: page.toString()
              }
            })}
          />
        </div>
      )}
    </>
  );
};

UsersPage = observer(UsersPage);

export default defineRoute(async request => {
  let page = parseInt(request.query.page) || 1;
  if (page < 1) page = 1;

  let sortBy = request.query.sortBy as SortBy;
  if (!(sortBy in SortBy))
    sortBy = appState.serverPreference.misc.sortUserByRating ? SortBy.rating : SortBy.acceptedProblemCount;

  const [users, count] = await fetchData(sortBy, page);

  return <UsersPage sortBy={sortBy} users={users} totalCount={count} currentPage={page} />;
});

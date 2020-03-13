import React, { useEffect, useRef, useState } from "react";
import { Table, Search, Image, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import { useNavigation, Link } from "react-navi";

import style from "./UsersPage.module.less";

import { UserApi } from "@/api";
import toast from "@/utils/toast";
import { UserMeta } from "@/interfaces/UserMeta";
import { useIntlMessage } from "@/utils/hooks";
import { appState } from "@/appState";
import Pagination from "@/components/Pagination";
import UserLink from "@/components/UserLink";
import { useDebouncedCallback } from "use-debounce/lib";
import getUserAvatar from "@/utils/getUserAvatar";
import UserSearch from "@/components/UserSearch";

const USERS_PER_PAGE = 30;

enum SortBy {
  rating = "rating",
  acceptedProblemCount = "acceptedProblemCount"
}

async function fetchData(sortBy: SortBy, currentPage: number): Promise<[UserMeta[], number]> {
  const { requestError, response } = await UserApi.getUserList({
    sortBy,
    skipCount: USERS_PER_PAGE * (currentPage - 1),
    takeCount: USERS_PER_PAGE
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return [null, null];
  }

  return [response.userMetas, response.count];
}

interface UsersPageProps {
  users: UserMeta[];
  sortBy: SortBy;
  currentPage: number;
  totalCount: number;
}

let UsersPage: React.FC<UsersPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(_("users.title"));
  }, [appState.locale]);

  function changePage(page: number) {
    navigation.navigate({
      query: {
        page: page.toString()
      }
    });
  }

  return (
    <>
      <div className={style.searchContainer}>
        <UserSearch onResultSelect={user => navigation.navigate(`/user/${user.id}`)} />
      </div>
      <Table unstackable basic="very" textAlign="center" className={style.table}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell className={style.columnRank}>{_("users.rank")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnUsername}>{_("users.username")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnBio}>{_("users.bio")}</Table.HeaderCell>
            <Table.HeaderCell className={style.columnAcceptedProblemCount}>
              {props.sortBy === SortBy.acceptedProblemCount ? (
                <>
                  {_("users.accepted_problem_count")}
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
                  {_("users.accepted_problem_count")}
                </Link>
              )}
            </Table.HeaderCell>
            <Table.HeaderCell className={style.columnRating}>
              {props.sortBy === SortBy.rating ? (
                <>
                  {_("users.rating")}
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
                  {_("users.rating")}
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
                <div>{user.bio}</div>
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
            onPageChange={changePage}
          />
        </div>
      )}
    </>
  );
};

UsersPage = observer(UsersPage);

export default route({
  async getView(request) {
    let page = parseInt(request.query.page) || 1;
    if (page < 1) page = 1;

    let sortBy = request.query.sortBy as SortBy;
    if (!(sortBy in SortBy)) sortBy = SortBy.rating;

    const [users, count] = await fetchData(sortBy, page);
    if (!users) {
      // TODO: Display an error page
      return null;
    }

    return <UsersPage sortBy={sortBy} users={users} totalCount={count} currentPage={page} />;
  }
});

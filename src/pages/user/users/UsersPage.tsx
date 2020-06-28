import React, { useEffect } from "react";
import { Table, Icon, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useNavigation, Link } from "react-navi";
import { FormattedMessage } from "react-intl";

import style from "./UsersPage.module.less";

import { UserApi } from "@/api";
import { UserMeta } from "@/interfaces/UserMeta";
import { useIntlMessage } from "@/utils/hooks";
import { appState } from "@/appState";
import Pagination from "@/components/Pagination";
import UserLink from "@/components/UserLink";
import UserSearch from "@/components/UserSearch";
import { defineRoute, RouteError } from "@/AppRouter";

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

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`users.error.${response.error}`} />);

  return [response.userMetas, response.count];
}

interface UsersPageProps {
  users: UserMeta[];
  sortBy: SortBy;
  currentPage: number;
  totalCount: number;
}

let UsersPage: React.FC<UsersPageProps> = props => {
  const _ = useIntlMessage("users");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(_(".title"));
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
      <div className={style.header}>
        <UserSearch onResultSelect={user => navigation.navigate(`/user/${user.id}`)} />
        {appState.currentUserHasPrivilege("MANAGE_USER_GROUP") && (
          <Button primary className={style.manageGroups} content={_(".manage_groups")} as={Link} href="/users/groups" />
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

export default defineRoute(async request => {
  let page = parseInt(request.query.page) || 1;
  if (page < 1) page = 1;

  let sortBy = request.query.sortBy as SortBy;
  if (!(sortBy in SortBy)) sortBy = SortBy.rating;

  const [users, count] = await fetchData(sortBy, page);

  return <UsersPage sortBy={sortBy} users={users} totalCount={count} currentPage={page} />;
});

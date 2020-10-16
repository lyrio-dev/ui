import React, { useEffect, useState } from "react";
import { Breadcrumb, Button, Header, Icon, Label, Menu, Segment, Table } from "semantic-ui-react";
import { Link, useNavigation } from "react-navi";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react";

import style from "./DiscussionsPage.module.less";

import { defineRoute, RouteError } from "@/AppRouter";
import { appState } from "@/appState";
import { DiscussionApi } from "@/api";
import { useIntlMessage } from "@/utils/hooks";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";
import UserSearch from "@/components/UserSearch";
import Pagination from "@/components/Pagination";
import PreviewSearch from "@/components/PreviewSearch";
import { getDiscussionDisplayTitle, getDiscussionUrl } from "../utils";
import toast from "@/utils/toast";
import { getProblemDisplayName, getProblemUrl } from "@/pages/problem/utils";
import UserLink from "@/components/UserLink";
import formatDateTime from "@/utils/formatDateTime";

export function getBreadcrumb(
  problem: { meta: ApiTypes.ProblemMetaDto; title: string },
  _: (id: string) => string,
  allProblems?: boolean
) {
  return (
    <Breadcrumb className={style.breadcrumb}>
      <Breadcrumb.Section>{_("discussions.breadcrumb.discussion")}</Breadcrumb.Section>
      <Breadcrumb.Divider icon="right angle" />
      {allProblems ? (
        <>
          <Breadcrumb.Section
            active
            as={Link}
            href={({ pathname: "/discussions", query: { problemId: "all" } } as unknown) as string}
          >
            {_("discussions.breadcrumb.problem")}
          </Breadcrumb.Section>
        </>
      ) : problem ? (
        <>
          <Breadcrumb.Section
            active
            as={Link}
            href={({ pathname: "/discussions", query: { problemId: "all" } } as unknown) as string}
            className={style.allProblemsLink}
          >
            {_("discussions.breadcrumb.problem")}
          </Breadcrumb.Section>
          <Breadcrumb.Divider icon="right angle" />
          <Breadcrumb.Section active as={Link} href={getProblemUrl(problem.meta)}>
            {getProblemDisplayName(problem.meta, problem.title, _, "all")}
          </Breadcrumb.Section>
        </>
      ) : (
        <>
          <Breadcrumb.Section active as={Link} href="/discussions">
            {_("discussions.breadcrumb.general")}
          </Breadcrumb.Section>
        </>
      )}
    </Breadcrumb>
  );
}

// Parsed from querystring, without pagination
interface DiscussionsPageSearchQuery {
  keyword: string;
  problemId: number;
  publisherId: number;
  nonpublic: boolean;
}

function generateRequestFromSearchQuery(
  searchQuery: DiscussionsPageSearchQuery,
  currentPage = 1
): ApiTypes.QueryDiscussionsRequestDto {
  const requestBody: ApiTypes.QueryDiscussionsRequestDto = {
    locale: appState.locale,
    skipCount: DISCUSSIONS_PER_PAGE * (currentPage - 1),
    takeCount: DISCUSSIONS_PER_PAGE
  };
  if (searchQuery.keyword) requestBody.keyword = searchQuery.keyword;
  if (searchQuery.problemId) requestBody.problemId = searchQuery.problemId;
  if (searchQuery.publisherId) requestBody.publisherId = searchQuery.publisherId;
  if (searchQuery.nonpublic) requestBody.nonpublic = true;

  return requestBody;
}

async function fetchData(
  searchQuery: DiscussionsPageSearchQuery,
  currentPage: number
): Promise<ApiTypes.QueryDiscussionsResponseDto> {
  const { requestError, response } = await DiscussionApi.queryDiscussions(
    generateRequestFromSearchQuery(searchQuery, currentPage)
  );

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`discussions.error.${response.error}`} />);

  return response;
}

function parseSearchQuery(query: Record<string, string>): DiscussionsPageSearchQuery {
  const searchQuery: DiscussionsPageSearchQuery = {
    keyword: query["keyword"] || "",
    problemId:
      query["problemId"] === "all"
        ? -1
        : Number.isSafeInteger(Number(query["problemId"]))
        ? Number(query["problemId"])
        : null,
    publisherId: Number.isSafeInteger(Number(query["publisherId"])) ? Number(query["publisherId"]) : null,
    nonpublic: query["nonpublic"] != null
  };
  return searchQuery;
}

function generateSearchQuery(searchQuery: DiscussionsPageSearchQuery): Record<string, string> {
  const query: Record<string, string> = {};
  if (searchQuery.keyword) query.keyword = searchQuery.keyword.substr(0, 100);
  if (searchQuery.problemId) query.problemId = searchQuery.problemId.toString();
  if (searchQuery.publisherId) query.publisherId = searchQuery.publisherId.toString();
  if (searchQuery.nonpublic) query.nonpublic = "";
  return query;
}

const DISCUSSIONS_PER_PAGE = appState.serverPreference.pagination.discussions;

interface DiscussionSearchProps {
  queryParameters: Omit<ApiTypes.QueryDiscussionsRequestDto, "keyword" | "titleOnly" | "skipCount" | "takeCount">;
  onResultSelect: (discussion: ApiTypes.QueryDiscussionsResponseDiscussionDto) => void;
  onEnterPress?: (searchKeyword: string) => void;
}

const SEARCH_DISCUSSION_PREVIEW_LIST_LENGTH = appState.serverPreference.pagination.searchDiscussionsPreview;

let DiscussionSearch: React.FC<DiscussionSearchProps> = props => {
  const _ = useIntlMessage("discussions.search_discussion");

  return (
    <PreviewSearch
      className={style.search}
      placeholder={_(".placeholder")}
      noResultsMessage={_(".no_result")}
      onGetResultKey={result => result.meta.id}
      onSearch={async input => {
        if (!input) return [];

        const { requestError, response } = await DiscussionApi.queryDiscussions(
          Object.assign({}, props.queryParameters, {
            keyword: input,
            titleOnly: true,
            skipCount: 0,
            takeCount: SEARCH_DISCUSSION_PREVIEW_LIST_LENGTH
          })
        );

        if (requestError) toast.error(requestError);
        else return response.discussions;

        return [];
      }}
      onRenderResult={result => <div className="title">{getDiscussionDisplayTitle(result.meta.title, _)}</div>}
      onResultSelect={props.onResultSelect}
      onEnterPress={props.onEnterPress}
    />
  );
};

interface DiscussionsPageProps {
  searchQuery: DiscussionsPageSearchQuery;
  currentPage: number;
  response: ApiTypes.QueryDiscussionsResponseDto;
}

let DiscussionsPage: React.FC<DiscussionsPageProps> = props => {
  const _ = useIntlMessage("discussions");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "discussion");
  }, [appState.locale]);

  const navigation = useNavigation();

  const isMobileOrPad = useScreenWidthWithin(0, 1024);
  const isVeryNarrowScreen = useScreenWidthWithin(0, 640);

  const allProblems = props.searchQuery.problemId === -1;

  // Begin search
  type SearchMode = "title" | "user";
  const [searchMode, setSearchMode] = useState<SearchMode>("title");

  function redirectWithFilter(filter: Partial<DiscussionsPageSearchQuery>) {
    navigation.navigate({
      query: generateSearchQuery(Object.assign({}, props.searchQuery, filter))
    });
  }

  function onAddFilterKeyword(searchKeyword: string) {
    redirectWithFilter({
      keyword: searchKeyword.substr(0, 100)
    });
  }

  function onDelFilterKeyword() {
    redirectWithFilter({
      keyword: ""
    });
  }

  function onAddFilterPublisher(publisherId: number) {
    redirectWithFilter({
      publisherId: publisherId
    });
  }

  function onDelFilterPublisher() {
    // A non-privileged user can only filter "nonpublic" if the "publisher" itself is applied.
    // If the "publisher" filter is removed, the "nonpublic" filter should also be removed.
    if (!props.response.permissions.filterNonpublic && props.searchQuery.nonpublic) {
      redirectWithFilter({
        publisherId: null,
        nonpublic: false
      });
    } else {
      redirectWithFilter({
        publisherId: null
      });
    }
  }

  function onAddFilterNonpublic() {
    // A non-privileged user can only filter "nonpublic" if the "publisher" itself is applied.
    // If the "publisher" filter is not applied, it should be applied.
    if (props.searchQuery.nonpublic) return;
    if (!props.response.permissions.filterNonpublic && appState.currentUser) {
      redirectWithFilter({
        publisherId: appState.currentUser.id,
        nonpublic: true
      });
    } else {
      redirectWithFilter({
        nonpublic: true
      });
    }
  }

  function onDelFilterNonpublic() {
    redirectWithFilter({
      nonpublic: false
    });
  }
  // End search

  function onPageChange(page: number) {
    navigation.navigate({
      query: Object.assign(
        {
          page: page.toString()
        },
        generateSearchQuery(props.searchQuery)
      )
    });
  }

  const getPagination = () =>
    props.response.count <= DISCUSSIONS_PER_PAGE ? null : (
      <Pagination
        totalCount={props.response.count}
        currentPage={props.currentPage}
        itemsPerPage={DISCUSSIONS_PER_PAGE}
        onPageChange={onPageChange}
      />
    );

  /**
   * Search title: while user typing, results are listed below, when user select a result, redirect to that discussion
   * Search user: while user typing, users are listed below, when user select a user, it's added to the filters
   * Nonpublic: click to filter nonpublic discussions only, not a mode
   */
  const headerSearch = (
    <>
      {searchMode === "title" ? (
        <DiscussionSearch
          queryParameters={generateRequestFromSearchQuery(props.searchQuery)}
          onResultSelect={discussion => navigation.navigate(getDiscussionUrl(discussion.meta))}
          onEnterPress={searchKeyword => onAddFilterKeyword(searchKeyword)}
        />
      ) : (
        // Search user
        <UserSearch className={style.search} onResultSelect={user => onAddFilterPublisher(user.id)} />
      )}
      <Menu className={style.searchMenu} secondary>
        <Menu.Item
          className={style.searchMenuItem}
          icon="user"
          active={searchMode === "user"}
          title={_(".search_icon.user")}
          onClick={() => (searchMode === "user" ? setSearchMode("title") : setSearchMode("user"))}
        />
        {(props.response.permissions.filterNonpublic ||
          (appState.currentUser && props.searchQuery.publisherId === appState.currentUser.id)) && (
          <Menu.Item
            className={style.searchMenuItem}
            icon="eye slash"
            active={false}
            title={_(".search_icon.nonpublic")}
            onClick={() => onAddFilterNonpublic()}
          />
        )}
      </Menu>
    </>
  );

  // To display the current search filters applied on the search result.
  const filtersApplied = props.searchQuery.keyword || props.response.filterPublisher || props.searchQuery.nonpublic;
  const headerSearchFilters = filtersApplied && (
    <>
      <strong>{_(".search_filters")}</strong>
      {props.searchQuery.keyword && (
        <Label size="small" color="grey">
          <Icon name="file alternate" />
          {props.searchQuery.keyword}
          <Icon name="delete" onClick={() => onDelFilterKeyword()} />
        </Label>
      )}
      {props.response.filterPublisher && (
        <Label size="small" color="pink">
          <Icon name="user" />
          {props.response.filterPublisher.username}
          <Icon name="delete" onClick={() => onDelFilterPublisher()} />
        </Label>
      )}
      {props.searchQuery.nonpublic && (
        <Label size="small" color="red">
          <Icon name="eye slash" />
          {_(".non_public")}
          <Icon name="delete" onClick={() => onDelFilterNonpublic()} />
        </Label>
      )}
    </>
  );

  const headerButtons = allProblems ? null : (
    <div className={style.headerButtons}>
      {props.response.permissions.createDiscussion && (
        <Button
          size={isMobileOrPad ? "small" : "mini"}
          className={isMobileOrPad ? "icon" : "labeled icon"}
          icon="plus"
          content={isMobileOrPad ? "" : _(".add_discussion")}
          as={Link}
          href={{
            pathname: "/discussion/new",
            query: props.response.filterProblem && {
              problemId: props.response.filterProblem.meta.id
            }
          }}
        />
      )}
    </div>
  );

  const hideProblemColumn = !allProblems;

  return (
    <>
      {isVeryNarrowScreen ? (
        <>
          {getBreadcrumb(props.response.filterProblem, _, allProblems)}
          <div className={style.headerRow}>
            {headerSearch}
            {headerButtons}
          </div>
          <div className={style.headerSearchFiltersRow}>{headerSearchFilters}</div>
        </>
      ) : (
        <>
          {getBreadcrumb(props.response.filterProblem, _, allProblems)}
          <div className={style.headerRow}>
            {headerSearch}
            <div className={style.headerRightControls}>{headerButtons}</div>
          </div>
          <div className={style.headerSearchFiltersRow}>{headerSearchFilters}</div>
        </>
      )}
      {props.response.discussions.length === 0 ? (
        filtersApplied ? (
          <Segment placeholder>
            <Header icon>
              <Icon name="search" />
              {_(".no_discussions.message_search")}
            </Header>
            <Segment.Inline>
              <Button primary onClick={() => navigation.goBack()}>
                {_(".no_discussions.back")}
              </Button>
              <Button
                onClick={() =>
                  redirectWithFilter({
                    keyword: "",
                    publisherId: null,
                    nonpublic: false
                  })
                }
              >
                {_(".no_discussions.clear_filters")}
              </Button>
            </Segment.Inline>
          </Segment>
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="file" />
              {_(".no_discussions.message_no_search")}
            </Header>
            {props.response.permissions.createDiscussion && (
              <Segment.Inline>
                <Button primary as={Link} href="/problem/new">
                  {_(".no_discussions.clear_filters")}
                </Button>
              </Segment.Inline>
            )}
          </Segment>
        )
      ) : (
        <Table basic="very" textAlign="center" unstackable>
          <Table.Header>
            <Table.Row className={style.tableHeaderRow}>
              {isVeryNarrowScreen ? (
                <Table.HeaderCell className={style.twoRow} textAlign="left">
                  <div>{_(".column_title")}</div>
                  {!hideProblemColumn && <div>{_(".column_problem")}</div>}
                  <div>
                    <div>{_(".column_publisher")}</div>
                    <div>{_(".column_sort_time")}</div>
                  </div>
                </Table.HeaderCell>
              ) : (
                <>
                  <Table.HeaderCell textAlign="left">{_(".column_title")}</Table.HeaderCell>
                  {!hideProblemColumn && <Table.HeaderCell textAlign="left">{_(".column_problem")}</Table.HeaderCell>}
                  <Table.HeaderCell textAlign="right">{_(".column_publisher")}</Table.HeaderCell>
                  {!isMobileOrPad && (
                    <Table.HeaderCell width={1} className={style.nowrapRow}>
                      {_(".column_reply_count")}
                    </Table.HeaderCell>
                  )}
                  <Table.HeaderCell width={1} className={style.nowrapRow}>
                    {_(".column_sort_time")}
                  </Table.HeaderCell>
                </>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.response.discussions.map(discussion => (
              <Table.Row className={style.row} key={discussion.meta.id}>
                {(() => {
                  const columnTitle = (
                    <>
                      <Link href={getDiscussionUrl(discussion.meta)}>
                        {getDiscussionDisplayTitle(discussion.meta.title, _)}
                      </Link>
                      {!discussion.meta.isPublic && (
                        <Label
                          className={style.labelNonPublic}
                          icon="eye slash"
                          size="small"
                          color="red"
                          content={_(".non_public")}
                          as="a"
                          // As long as a user can see the "nonpublic" label, it has the permission to filter the
                          // nonpublic discussions
                          onClick={() => onAddFilterNonpublic()}
                        />
                      )}
                    </>
                  );

                  const columnProblem = !hideProblemColumn && (
                    <>
                      {discussion.problem && (
                        <Link href={getProblemUrl(discussion.problem.meta)}>
                          {getProblemDisplayName(discussion.problem.meta, discussion.problem.title, _, "all")}
                        </Link>
                      )}
                    </>
                  );

                  const columnPublisher = <UserLink user={discussion.publisher} />;

                  return isVeryNarrowScreen ? (
                    <Table.Cell className={style.twoRow} textAlign="left">
                      <div>{columnTitle}</div>
                      {columnProblem && <div>{columnProblem}</div>}
                      <div>
                        <div>{columnPublisher}</div>
                        <div>{formatDateTime(discussion.meta.sortTime)[1]}</div>
                      </div>
                    </Table.Cell>
                  ) : (
                    <>
                      <Table.Cell textAlign="left">{columnTitle}</Table.Cell>
                      {columnProblem && <Table.Cell textAlign="left">{columnProblem}</Table.Cell>}
                      <Table.Cell textAlign="right">{columnPublisher}</Table.Cell>
                      {!isMobileOrPad && (
                        <Table.Cell className={style.nowrapRow}>{discussion.meta.replyCount}</Table.Cell>
                      )}
                      <Table.Cell className={style.nowrapRow}>
                        {isMobileOrPad ? (
                          <span title={formatDateTime(discussion.meta.sortTime)[1]}>
                            {formatDateTime(discussion.meta.sortTime)[0]}
                          </span>
                        ) : (
                          formatDateTime(discussion.meta.sortTime)[1]
                        )}
                      </Table.Cell>
                    </>
                  );
                })()}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      <div className={style.pagination}>{getPagination()}</div>
    </>
  );
};

DiscussionsPage = observer(DiscussionsPage);

export default defineRoute(async request => {
  const page = parseInt(request.query.page) || 1;
  const searchQuery = parseSearchQuery(request.query);
  const response = await fetchData(searchQuery, page);

  return <DiscussionsPage searchQuery={searchQuery} currentPage={page} response={response} />;
});

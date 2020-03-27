import React, { useEffect, useState, useRef } from "react";
import { Search, Checkbox, Table, Label, Button, Header, Menu, Segment, Loader, Icon } from "semantic-ui-react";
import { useNavigation, Link } from "react-navi";
import { observer } from "mobx-react";

import style from "./ProblemSetPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import toast from "@/utils/toast";
import { sortTags, sortTagColors } from "../problemTag";
import { FormattedMessage } from "react-intl";

import Pagination from "@/components/Pagination";
import ProblemTagManager from "./ProblemTagManager";
import UserSearch from "@/components/UserSearch";
import { defineRoute, RouteError } from "@/AppRouter";

interface ProblemRecord extends ApiTypes.ProblemMetaDto {
  title: string;
  tags: ApiTypes.LocalizedProblemTagDto[];
}

// Parsed from querystring, without pagination
interface ProblemSetPageSearchQuery {
  keyword: string;
  tagIds: number[];
  ownerId: number;
  nonpublic: boolean;
}

async function fetchData(
  searchQuery: ProblemSetPageSearchQuery,
  currentPage: number
): Promise<[ProblemRecord[], ApiTypes.QueryProblemSetResponseDto]> {
  const requestBody: ApiTypes.QueryProblemSetRequestDto = {
    locale: appState.locale,
    skipCount: PROBLEMS_PER_PAGE * (currentPage - 1),
    takeCount: PROBLEMS_PER_PAGE
  };
  if (searchQuery.keyword) requestBody.keyword = searchQuery.keyword;
  if (searchQuery.tagIds.length > 0) requestBody.tagIds = searchQuery.tagIds;
  if (searchQuery.ownerId) requestBody.ownerId = searchQuery.ownerId;
  if (searchQuery.nonpublic) requestBody.nonpublic = true;
  const { requestError, response } = await ProblemApi.queryProblemSet(requestBody);

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError((<FormattedMessage id={`problem_set.error.${response.error}`} />));

  return [
    response.result.map(item => ({
      ...item.meta,
      title: item.title,
      tags: sortTags(item.tags)
    })),
    response
  ];
}

function parseSearchQuery(query: Record<string, string>): ProblemSetPageSearchQuery {
  const searchQuery: ProblemSetPageSearchQuery = {
    keyword: query["keyword"] || "",
    tagIds: (query["tagIds"] || "")
      .split(",")
      .map(Number)
      .filter(x => x && Number.isSafeInteger(x))
      .sort(),
    ownerId: Number.isSafeInteger(Number(query["ownerId"])) ? Number(query["ownerId"]) : null,
    nonpublic: query["nonpublic"] != null
  };
  return searchQuery;
}

function generateSearchQuery(searchQuery: ProblemSetPageSearchQuery): Record<string, string> {
  const query: Record<string, string> = {};
  if (searchQuery.keyword) query.keyword = searchQuery.keyword.substr(0, 100);
  if (searchQuery.tagIds.length > 0) query.tagIds = searchQuery.tagIds.join(",");
  if (searchQuery.ownerId) query.ownerId = searchQuery.ownerId.toString();
  if (searchQuery.nonpublic) query.nonpublic = "";
  return query;
}

// TODO: Make this a config item, maybe from server?
const PROBLEMS_PER_PAGE = 50;

interface ProblemSetPageProps {
  searchQuery: ProblemSetPageSearchQuery;
  currentPage: number;
  problems: ProblemRecord[];
  response: ApiTypes.QueryProblemSetResponseDto;
}

let ProblemSetPage: React.FC<ProblemSetPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(_("problem_set.title"));
  }, [appState.locale]);

  const navigation = useNavigation();

  const isMobile = appState.isScreenWidthIn(0, 768);

  const refOnOpenTagManager = useRef<() => Promise<boolean>>();

  // Begin search
  type SearchMode = "title" | "tag" | "user";
  const [searchMode, setSearchMode] = useState<SearchMode>("title");
  const [searchKeyword, setSearchKeyword] = useState("");
  function changeSearchMode(newSearchMode: SearchMode) {
    setSearchKeyword("");
    setSearchMode(newSearchMode);
    if (newSearchMode === "tag") getTags();
  }

  const [tags, setTags] = useState<Record<number, ApiTypes.LocalizedProblemTagDto>>();
  async function getTags() {
    if (tags) return;

    const { requestError, response } = await ProblemApi.getAllProblemTags({
      locale: appState.locale
    });
    if (requestError) toast.error(requestError);
    else setTags(Object.fromEntries(response.tags.map(tag => [tag.id, tag])));
  }

  const tagEntires =
    !tags || searchMode !== "tag"
      ? []
      : !searchKeyword
      ? Object.entries(tags)
      : Object.entries(tags).filter(([tagId, tag]) => tag.name.indexOf(searchKeyword) !== -1);
  const tagsCount = tagEntires.length;
  const colors = sortTagColors(Array.from(new Set(tagEntires.map(([tagId, tag]) => tag.color))));
  const tagsByColor = Object.fromEntries(
    colors.map(color => [
      color,
      tagEntires
        .map(([i, tag]) => (tag.color === color ? Number(i) : null))
        .filter(x => x != null)
        .sort((i, j) => (tags[i].name < tags[j].name ? -1 : tags[i].name > tags[j].name ? 1 : 0))
    ])
  );

  function redirectWithFilter(filter: Partial<ProblemSetPageSearchQuery>) {
    navigation.navigate({
      query: generateSearchQuery(Object.assign({}, props.searchQuery, filter))
    });
    if (searchMode !== "tag") setSearchKeyword("");
  }

  function onAddFilterKeyword() {
    if (!searchKeyword) return;
    redirectWithFilter({
      keyword: searchKeyword.substr(0, 100)
    });
  }

  function onDelFilterKeyword() {
    redirectWithFilter({
      keyword: ""
    });
  }

  function onAddFilterOwner(ownerId: number) {
    redirectWithFilter({
      ownerId: ownerId
    });
  }

  function onAddFilterTag(tagId: number) {
    if (props.searchQuery.tagIds.includes(tagId) && props.searchQuery.tagIds.length < 20) return;
    redirectWithFilter({
      tagIds: props.searchQuery.tagIds.concat(tagId).sort()
    });
  }

  function onDelFilterTag(tagId: number) {
    if (!props.searchQuery.tagIds.includes(tagId)) return;
    redirectWithFilter({
      tagIds: props.searchQuery.tagIds.filter(x => x !== tagId).sort()
    });
  }

  function onDelFilterOwner() {
    // A non-privileged user can only filter "nonpublic" if the "owner" itself is applied.
    // If the "owner" filter is removed, the "nonpublic" filter should also be removed.
    if (!props.response.permissions.filterNonpublic && props.searchQuery.nonpublic) {
      redirectWithFilter({
        ownerId: null,
        nonpublic: false
      });
    } else {
      redirectWithFilter({
        ownerId: null
      });
    }
  }

  function onAddFilterNonpublic() {
    // A non-privileged user can only filter "nonpublic" if the "owner" itself is applied.
    // If the "owner" filter is not applied, it should be applied.
    if (props.searchQuery.nonpublic) return;
    if (!props.response.permissions.filterNonpublic && appState.currentUser) {
      redirectWithFilter({
        ownerId: appState.currentUser.id,
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

  function changePage(page: number) {
    navigation.navigate({
      query: {
        page: page.toString()
      }
    });
  }

  const getPagination = () =>
    props.response.count <= PROBLEMS_PER_PAGE ? null : (
      <Pagination
        totalCount={props.response.count}
        currentPage={props.currentPage}
        itemsPerPage={PROBLEMS_PER_PAGE}
        onPageChange={changePage}
      />
    );

  const getTagLabel = (tag: ApiTypes.LocalizedProblemTagDto, type: "add" | "del" = "add") => (
    <Label
      as={type === "add" ? "a" : undefined}
      key={tag.id}
      className={style.tag}
      size="small"
      content={tag.name}
      color={tag.color as any}
      removeIcon={type === "del" ? <Icon name="delete" /> : undefined}
      onClick={type === "add" ? () => onAddFilterTag(tag.id) : undefined}
      onRemove={type === "del" ? () => onDelFilterTag(tag.id) : undefined}
    />
  );

  /**
   * Search title: while user typing, results are listed below, when user select a result, redirect to that problem
   * Search tag: while user typing, tags below in the tag list are filtered, when user click a tag, it's added to the filters
   * Search user: while user typing, users are listed below, when user select a user, it's added to the filters
   * Nonpublic: click to filter nonpublic problems only, not a mode
   */
  const headerSearch = (
    <>
      {searchMode === "title" ? (
        // Search title
        <Search
          className={style.search}
          placeholder={_("problem_set.search_placeholder.title")}
          value={searchKeyword}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.keyCode === 13 && onAddFilterKeyword()}
          noResultsMessage={_("problem_set.no_result_title")}
          onSearchChange={(e, { value }) => setSearchKeyword(value)}
          input={{ iconPosition: "left", fluid: isMobile }}
        />
      ) : searchMode === "tag" ? (
        // Search tag
        <Search
          className={style.search}
          placeholder={_("problem_set.search_placeholder.tag")}
          value={searchKeyword}
          showNoResults={false}
          onSearchChange={(e, { value }) => setSearchKeyword(value)}
          input={{ iconPosition: "left", fluid: isMobile }}
        />
      ) : (
        // Search user
        <UserSearch className={style.search} onResultSelect={user => onAddFilterOwner(user.id)} />
      )}
      <Menu className={style.searchMenu} secondary>
        <Menu.Item
          className={style.searchMenuItem}
          icon="tag"
          active={searchMode === "tag"}
          title={_("problem_set.search_icon.tag")}
          onClick={() => (searchMode === "tag" ? changeSearchMode("title") : changeSearchMode("tag"))}
        />
        {props.response.permissions.filterByOwner && (
          <Menu.Item
            className={style.searchMenuItem}
            icon="user"
            active={searchMode === "user"}
            title={_("problem_set.search_icon.user")}
            onClick={() => (searchMode === "user" ? changeSearchMode("title") : changeSearchMode("user"))}
          />
        )}
        {(props.response.permissions.filterNonpublic ||
          (appState.currentUser && props.searchQuery.ownerId === appState.currentUser.id)) && (
          <Menu.Item
            className={style.searchMenuItem}
            icon="eye slash"
            active={false}
            title={_("problem_set.search_icon.nonpublic")}
            onClick={() => onAddFilterNonpublic()}
          />
        )}
      </Menu>
    </>
  );

  const headerTagList = searchMode === "tag" && (
    <Segment className={style.tagsList + (!tags ? " " + style.loading : "")}>
      {!tags ? (
        <Loader active size="medium" />
      ) : tagsCount === 0 ? (
        searchKeyword === "" ? (
          <div className={style.placeholder}>{_("problem_set.no_matching_tags")}</div>
        ) : (
          <div className={style.placeholder}>{_("problem_set.no_tags")}</div>
        )
      ) : (
        Object.entries(tagsByColor).map(([color, tagIDs]) => <p key={color}>{tagIDs.map(i => getTagLabel(tags[i]))}</p>)
      )}
    </Segment>
  );

  // To display the current search filters applied on the search result.
  const filtersApplied =
    props.searchQuery.keyword || props.response.filterTags || props.response.filterOwner || props.searchQuery.nonpublic;
  const headerSearchFilters = filtersApplied && (
    <>
      <strong>{_("problem_set.search_filters")}</strong>
      {props.searchQuery.keyword && (
        <Label size="small" color="grey">
          <Icon name="file alternate" />
          {props.searchQuery.keyword}
          <Icon name="delete" onClick={() => onDelFilterKeyword()} />
        </Label>
      )}
      {props.response.filterOwner && (
        <Label size="small" color="pink">
          <Icon name="user" />
          {props.response.filterOwner.username}
          <Icon name="delete" onClick={() => onDelFilterOwner()} />
        </Label>
      )}
      {props.searchQuery.nonpublic && (
        <Label size="small" color="red">
          <Icon name="eye slash" />
          {_("problem_set.non_public")}
          <Icon name="delete" onClick={() => onDelFilterNonpublic()} />
        </Label>
      )}
      {props.response.filterTags && sortTags(props.response.filterTags).map(tag => getTagLabel(tag, "del"))}
    </>
  );

  const headerShowTagsCheckbox = (
    <>
      <Checkbox
        className={style.showTagsCheckbox}
        toggle
        checked={appState.showTagsInProblemSet}
        onChange={() => (appState.showTagsInProblemSet = !appState.showTagsInProblemSet)}
        label={_("problem_set.show_tags")}
      />
    </>
  );

  // The tag manager couldn't display correctly without 540px screen width
  const [openTagManagerPending, setOpenTagManagerPending] = useState(false);
  const headerButtons = (
    <div className={style.headerButtons}>
      {props.response.permissions.manageTags && appState.isScreenWidthIn(540, Infinity) && (
        <Button
          primary
          size="tiny"
          className="labeled icon"
          icon="tag"
          content={_("problem_set.manage_tags")}
          loading={openTagManagerPending}
          onClick={async () => {
            if (openTagManagerPending) return;
            setOpenTagManagerPending(true);
            await refOnOpenTagManager.current();
            setOpenTagManagerPending(false);
          }}
        />
      )}
      {props.response.permissions.createProblem && (
        <Button
          size="tiny"
          className="labeled icon"
          icon="plus"
          content={_("problem_set.add_problem")}
          as={Link}
          href="/problem/new"
        />
      )}
    </div>
  );

  return (
    <>
      <ProblemTagManager refOpen={refOnOpenTagManager} />
      {isMobile ? (
        <>
          <div className={style.headerSearchRow}>{headerSearch}</div>
          <div className={style.headerSearchFiltersRow}>{headerSearchFilters}</div>
          {headerTagList}
          <div className={style.headerControlRow}>
            {headerShowTagsCheckbox}
            {headerButtons}
          </div>
        </>
      ) : (
        <>
          <div className={style.headerRow}>
            {headerSearch}
            <div className={style.headerRightControls}>
              {headerShowTagsCheckbox}
              {headerButtons}
            </div>
          </div>
          <div className={style.headerSearchFiltersRow}>{headerSearchFilters}</div>
          {headerTagList}
        </>
      )}
      <div className={style.topPagination + " " + style.pagination}>{getPagination()}</div>
      {props.problems.length === 0 ? (
        filtersApplied ? (
          <Segment placeholder>
            <Header icon>
              <Icon name="search" />
              {_("problem_set.no_problem.message_search")}
            </Header>
            <Segment.Inline>
              <Button primary onClick={() => navigation.goBack()}>
                {_("problem_set.no_problem.back")}
              </Button>
              <Button as={Link} href="/problems">
                {_("problem_set.no_problem.clear_filters")}
              </Button>
            </Segment.Inline>
          </Segment>
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="file" />
              {_("problem_set.no_problem.message_no_search")}
            </Header>
            {props.response.permissions.createProblem && (
              <Segment.Inline>
                <Button primary as={Link} href="/problem/new">
                  {_("problem_set.no_problem.clear_filters")}
                </Button>
              </Segment.Inline>
            )}
          </Segment>
        )
      ) : (
        <Table basic="very" textAlign="center" unstackable>
          <Table.Header>
            <Table.Row className={style.tableHeaderRow}>
              <Table.HeaderCell width={1}>#</Table.HeaderCell>
              <Table.HeaderCell textAlign="left">{_("problem_set.column_title")}</Table.HeaderCell>
              <Table.HeaderCell width={1}>{_("problem_set.column_submission_count")}</Table.HeaderCell>
              <Table.HeaderCell width={1}>{_("problem_set.column_accepted_rate")}</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.problems.map(problem => {
              return (
                <Table.Row className={style.row} key={problem.id}>
                  <Table.Cell>
                    <b>{problem.displayId ? problem.displayId : "P" + problem.id}</b>
                  </Table.Cell>
                  <Table.Cell textAlign="left" className={style.problemTitleCell}>
                    <Link href={problem.displayId ? `/problem/${problem.displayId}` : `/problem/by-id/${problem.id}`}>
                      {problem.title}
                    </Link>
                    {!problem.isPublic && (
                      <Label
                        className={style.labelNonPublic}
                        icon="eye slash"
                        size="small"
                        color="red"
                        content={_("problem_set.non_public")}
                        as="a"
                        // As long as a user can see the "nonpublic" label, it has the permission to filter the
                        // nonpublic problems
                        onClick={() => onAddFilterNonpublic()}
                      />
                    )}
                    <div className={style.tags} style={{ display: appState.showTagsInProblemSet ? null : "none" }}>
                      {problem.tags.map(tag => getTagLabel(tag))}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{problem.submissionCount}</Table.Cell>
                  <Table.Cell>
                    {Math.ceil((problem.acceptedSubmissionCount / problem.submissionCount) * 100 || 0).toFixed(2)}%
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
      <div className={style.pagination}>{getPagination()}</div>
    </>
  );
};

ProblemSetPage = observer(ProblemSetPage);

export default defineRoute(async request => {
  const page = parseInt(request.query.page) || 1;
  const searchQuery = parseSearchQuery(request.query);
  const [problems, response] = await fetchData(searchQuery, page);

  return (
    <ProblemSetPage
      // No key={uuid()}, so the search states are preserved
      searchQuery={searchQuery}
      currentPage={page}
      problems={problems}
      response={response}
    />
  );
});

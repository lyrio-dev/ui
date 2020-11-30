import React, { useEffect, useState, useRef, useMemo } from "react";
import { Search, Checkbox, Table, Label, Button, Header, Menu, Segment, Loader, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./ProblemSetPage.module.less";

import api from "@/api";
import { appState } from "@/appState";
import { useAsyncCallbackPending, useLocalizer, useScreenWidthWithin, useNavigationChecked, Link } from "@/utils/hooks";
import toast from "@/utils/toast";
import { sortTags, sortTagColors } from "../problemTag";
import { Pagination } from "@/components/Pagination";
import ProblemTagManager from "./ProblemTagManager";
import UserSearch from "@/components/UserSearch";
import { defineRoute, RouteError } from "@/AppRouter";
import { StatusIcon } from "@/components/StatusText";
import ProblemSearch from "@/components/ProblemSearch";
import { getProblemDisplayName, getProblemIdString, getProblemUrl } from "../utils";
import { makeToBeLocalizedText } from "@/locales";
import { EmojiRenderer } from "@/components/EmojiRenderer";

// Parsed from querystring, without pagination
interface ProblemSetPageSearchQuery {
  keyword: string;
  tagIds: number[];
  ownerId: number;
  nonpublic: boolean;
}

function generateRequestFromSearchQuery(
  searchQuery: ProblemSetPageSearchQuery,
  currentPage = 1
): ApiTypes.QueryProblemSetRequestDto {
  const requestBody: ApiTypes.QueryProblemSetRequestDto = {
    locale: appState.locale,
    skipCount: PROBLEMS_PER_PAGE * (currentPage - 1),
    takeCount: PROBLEMS_PER_PAGE
  };
  if (searchQuery.keyword) requestBody.keyword = searchQuery.keyword;
  if (searchQuery.tagIds.length > 0) requestBody.tagIds = searchQuery.tagIds;
  if (searchQuery.ownerId) requestBody.ownerId = searchQuery.ownerId;
  if (searchQuery.nonpublic) requestBody.nonpublic = true;

  return requestBody;
}

async function fetchData(
  searchQuery: ProblemSetPageSearchQuery,
  currentPage: number
): Promise<ApiTypes.QueryProblemSetResponseDto> {
  const { requestError, response } = await api.problem.queryProblemSet(
    generateRequestFromSearchQuery(searchQuery, currentPage)
  );

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`problem_set.error.${response.error}`));

  return response;
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

const PROBLEMS_PER_PAGE = appState.serverPreference.pagination.problemSet;

interface ProblemSetPageProps {
  searchQuery: ProblemSetPageSearchQuery;
  currentPage: number;
  response: ApiTypes.QueryProblemSetResponseDto;
}

let ProblemSetPage: React.FC<ProblemSetPageProps> = props => {
  const _ = useLocalizer("problem_set");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "problem_set");
  }, [appState.locale]);

  const navigation = useNavigationChecked();

  const isMobileOrPad = useScreenWidthWithin(0, 1024);
  const isVeryNarrowScreen = useScreenWidthWithin(0, 640);

  const refOnOpenTagManager = useRef<() => Promise<boolean>>();

  // Begin search
  type SearchMode = "title" | "tag" | "user";
  const [searchMode, setSearchMode] = useState<SearchMode>("title");
  const [searchTagKeyword, setSearchTagKeyword] = useState("");
  function changeSearchMode(newSearchMode: SearchMode) {
    setSearchTagKeyword("");
    setSearchMode(newSearchMode);
    if (newSearchMode === "tag") getTags();
  }

  const [tags, setTags] = useState<Record<number, ApiTypes.LocalizedProblemTagDto>>();
  async function getTags() {
    if (tags) return;

    const { requestError, response } = await api.problem.getAllProblemTags({
      locale: appState.locale
    });
    if (requestError) toast.error(requestError(_));
    else setTags(Object.fromEntries(response.tags.map(tag => [tag.id, tag])));
  }

  const tagEntires = useMemo(
    () =>
      !tags || searchMode !== "tag"
        ? []
        : !searchTagKeyword
        ? Object.entries(tags)
        : Object.entries(tags).filter(
            ([tagId, tag]) => tag.name.toLowerCase().indexOf(searchTagKeyword.toLowerCase()) !== -1
          ),
    [tags, searchMode, searchTagKeyword]
  );
  const tagsCount = tagEntires.length;
  const colors = useMemo(() => sortTagColors(Array.from(new Set(tagEntires.map(([tagId, tag]) => tag.color)))), [tags]);
  const tagsByColor = useMemo(
    () =>
      Object.fromEntries(
        colors.map(color => [
          color,
          tagEntires
            .map(([i, tag]) => (tag.color === color ? Number(i) : null))
            .filter(x => x != null)
            .sort((i, j) => (tags[i].name < tags[j].name ? -1 : tags[i].name > tags[j].name ? 1 : 0))
        ])
      ),
    [tagEntires]
  );

  const problems = useMemo(
    () =>
      props.response.result.map(problem => ({
        ...problem,
        tags: sortTags(problem.tags)
      })),
    [props.response]
  );

  function redirectWithFilter(filter: Partial<ProblemSetPageSearchQuery>) {
    navigation.navigate({
      query: generateSearchQuery(Object.assign({}, props.searchQuery, filter))
    });
    if (searchMode !== "tag") setSearchTagKeyword("");
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

  const getPagination = (className: string) =>
    props.response.count <= PROBLEMS_PER_PAGE ? null : (
      <div className={className}>
        <Pagination
          totalCount={props.response.count}
          currentPage={props.currentPage}
          itemsPerPage={PROBLEMS_PER_PAGE}
          pageUrl={page => ({
            query: Object.assign(
              {
                page: page.toString()
              },
              generateSearchQuery(props.searchQuery)
            )
          })}
        />
      </div>
    );

  const getTagLabel = (tag: ApiTypes.LocalizedProblemTagDto, type: "add" | "del" = "add") => (
    <EmojiRenderer key={tag.id}>
      <Label
        as={type === "add" ? "a" : undefined}
        className={style.tag}
        size="small"
        content={tag.name}
        color={tag.color as any}
        removeIcon={type === "del" ? <Icon name="delete" /> : undefined}
        onClick={type === "add" ? () => onAddFilterTag(tag.id) : undefined}
        onRemove={type === "del" ? () => onDelFilterTag(tag.id) : undefined}
      />
    </EmojiRenderer>
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
        <ProblemSearch
          className={style.search}
          queryParameters={generateRequestFromSearchQuery(props.searchQuery)}
          onResultSelect={problem => navigation.navigate(getProblemUrl(problem.meta))}
          onEnterPress={searchKeyword => onAddFilterKeyword(searchKeyword)}
        />
      ) : searchMode === "tag" ? (
        // Search tag
        <Search
          className={style.search}
          placeholder={_(".search_tag_placeholder")}
          value={searchTagKeyword}
          showNoResults={false}
          onSearchChange={(e, { value }) => setSearchTagKeyword(value)}
          input={{ iconPosition: "left", fluid: isMobileOrPad }}
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
          title={_(".search_icon.tag")}
          onClick={() => (searchMode === "tag" ? changeSearchMode("title") : changeSearchMode("tag"))}
        />
        {props.response.permissions.filterByOwner && (
          <Menu.Item
            className={style.searchMenuItem}
            icon="user"
            active={searchMode === "user"}
            title={_(".search_icon.user")}
            onClick={() => (searchMode === "user" ? changeSearchMode("title") : changeSearchMode("user"))}
          />
        )}
        {(props.response.permissions.filterNonpublic ||
          (appState.currentUser && props.searchQuery.ownerId === appState.currentUser.id)) && (
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

  const headerTagList = searchMode === "tag" && (
    <Segment className={style.tagsList + (!tags ? " " + style.loading : "")}>
      {!tags ? (
        <Loader active size="medium" />
      ) : tagsCount === 0 ? (
        searchTagKeyword === "" ? (
          <div className={style.placeholder}>{_(".no_matching_tags")}</div>
        ) : (
          <div className={style.placeholder}>{_(".no_tags")}</div>
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
      <strong>{_(".search_filters")}</strong>
      {props.searchQuery.keyword && (
        <EmojiRenderer>
          <Label size="small" color="grey">
            <Icon name="file alternate" />
            {props.searchQuery.keyword}
            <Icon name="delete" onClick={() => onDelFilterKeyword()} />
          </Label>
        </EmojiRenderer>
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
          {_(".non_public")}
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
        label={_(".show_tags")}
      />
    </>
  );

  // The tag manager couldn't display correctly without 540px screen width
  const [openTagManagerPending, onOpenTagManager] = useAsyncCallbackPending(
    async () => await refOnOpenTagManager.current()
  );
  const headerButtons = (
    <div className={style.headerButtons}>
      {props.response.permissions.manageTags && !isVeryNarrowScreen && (
        <Button
          primary
          className="labeled icon"
          icon="tag"
          content={_(".manage_tags")}
          loading={openTagManagerPending}
          onClick={onOpenTagManager}
        />
      )}
      {props.response.permissions.createProblem && (
        <Button className="labeled icon" icon="plus" content={_(".add_problem")} as={Link} href="/p/new" />
      )}
    </div>
  );

  return (
    <>
      <ProblemTagManager refOpen={refOnOpenTagManager} />
      {isMobileOrPad ? (
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
      {getPagination(style.topPagination + " " + style.pagination)}
      {problems.length === 0 ? (
        filtersApplied ? (
          <Segment placeholder>
            <Header icon>
              <Icon name="search" />
              {_(".no_problem.message_search")}
            </Header>
            <Segment.Inline>
              <Button primary onClick={() => navigation.goBack()}>
                {_(".no_problem.back")}
              </Button>
              <Button as={Link} href="/p">
                {_(".no_problem.clear_filters")}
              </Button>
            </Segment.Inline>
          </Segment>
        ) : (
          <Segment placeholder>
            <Header icon>
              <Icon name="file" />
              {_(".no_problem.message_no_search")}
            </Header>
            {props.response.permissions.createProblem && (
              <Segment.Inline>
                <Button primary as={Link} href="/p/new">
                  {_(".no_problem.create")}
                </Button>
              </Segment.Inline>
            )}
          </Segment>
        )
      ) : (
        <Table basic="very" textAlign="center" unstackable>
          <Table.Header>
            <Table.Row className={style.tableHeaderRow}>
              {appState.currentUser && <Table.HeaderCell width={1}>{_(".column_status")}</Table.HeaderCell>}
              <Table.HeaderCell width={1}>#</Table.HeaderCell>
              <Table.HeaderCell textAlign="left">{_(".column_title")}</Table.HeaderCell>
              <Table.HeaderCell width={1}>{_(".column_submission_count")}</Table.HeaderCell>
              {!isVeryNarrowScreen && <Table.HeaderCell width={1}>{_(".column_accepted_rate")}</Table.HeaderCell>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {problems.map(problem => (
              <Table.Row className={style.row} key={problem.meta.id}>
                {appState.currentUser && (
                  <Table.Cell>
                    {problem.submission && (
                      <Link href={`/s/${problem.submission.id}`}>
                        <StatusIcon status={problem.submission.status} noMarginRight />
                      </Link>
                    )}
                  </Table.Cell>
                )}
                <Table.Cell>
                  <b>{getProblemIdString(problem.meta, { hideHashTagOnDisplayId: true })}</b>
                </Table.Cell>
                <Table.Cell textAlign="left" className={style.problemTitleCell}>
                  <EmojiRenderer>
                    <Link href={getProblemUrl(problem.meta)}>{getProblemDisplayName(null, problem.title, _)}</Link>
                  </EmojiRenderer>
                  {!problem.meta.isPublic && (
                    <Label
                      className={style.labelNonPublic}
                      icon="eye slash"
                      size="small"
                      color="red"
                      content={_(".non_public")}
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
                <Table.Cell>{problem.meta.submissionCount}</Table.Cell>
                {!isVeryNarrowScreen && (
                  <Table.Cell>
                    {((problem.meta.acceptedSubmissionCount / problem.meta.submissionCount) * 100 || 0).toFixed(1)}%
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
      {getPagination(style.pagination)}
    </>
  );
};

ProblemSetPage = observer(ProblemSetPage);

export default defineRoute(async request => {
  const page = parseInt(request.query.page) || 1;
  const searchQuery = parseSearchQuery(request.query);
  const response = await fetchData(searchQuery, page);

  return <ProblemSetPage searchQuery={searchQuery} currentPage={page} response={response} />;
});

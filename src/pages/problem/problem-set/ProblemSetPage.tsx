import React, { useEffect } from "react";
import { Search, ButtonGroup, Dropdown, Checkbox, Grid, Table, Label, Button } from "semantic-ui-react";
import { mount, route } from "navi";
import { useNavigation, Link } from "react-navi";
import { observer } from "mobx-react";

import style from "./ProblemSetPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import toast from "@/utils/toast";

import Pagination from "@/components/Pagination";

interface ProblemRecord extends ApiTypes.ProblemMetaDto {
  title: string;
  tags: {
    id: number;
    name: string;
    color: string;
  }[];
}

async function fetchData(currentPage: number): Promise<[number, ProblemRecord[], boolean]> {
  const { requestError, response } = await ProblemApi.queryProblemSet({
    locale: appState.locale,
    skipCount: PROBLEMS_PER_PAGE * (currentPage - 1),
    takeCount: PROBLEMS_PER_PAGE
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return [null, null, null];
  }

  return [
    response.count,
    response.result.map(item => ({
      ...item.meta,
      title: item.title,
      tags: item.tags
    })),
    response.createProblemPermission
  ];
}

// TODO: Make this a config item, maybe from server?
const PROBLEMS_PER_PAGE = 50;

interface ProblemSetPageProps {
  totalCount: number;
  currentPage: number;
  problems: ProblemRecord[];
  createProblemPermission: boolean;
}

let ProblemSetPage: React.FC<ProblemSetPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = _("problem_set.title");
  }, [appState.locale]);

  const navigation = useNavigation();

  const isMobile = appState.isScreenWidthIn(0, 768);

  function changePage(page: number) {
    navigation.navigate({
      query: {
        page: page.toString()
      }
    });
  }

  const getPagination = () => (
    <Pagination
      totalCount={props.totalCount}
      currentPage={props.currentPage}
      itemsPerPage={PROBLEMS_PER_PAGE}
      onPageChange={changePage}
    />
  );

  const headerSearch = (
    <>
      <Search
        className={style.search}
        placeholder={_("problem_set.search_placeholder")}
        input={{ iconPosition: "left", fluid: isMobile }}
      />
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

  const headerAddButton = props.createProblemPermission && (
    <Button
      size="tiny"
      className={"labeled icon " + style.addButton}
      icon="plus"
      content={_("problem_set.add_problem")}
      as={Link}
      href="/problem/new"
    />
  );

  return (
    <>
      <Grid>
        {isMobile ? (
          <>
            <Grid.Row className={style.firstRow}>
              <Grid.Column width={16}>{headerSearch}</Grid.Column>
            </Grid.Row>
            <Grid.Row className={style.secondRow}>
              <Grid.Column width={16} className={style.showTagsCheckboxAndAddButtonContainer}>
                {headerShowTagsCheckbox}
                {headerAddButton}
              </Grid.Column>
            </Grid.Row>
          </>
        ) : (
          <Grid.Row className={style.headerRow}>
            <Grid.Column width={5}>{headerSearch}</Grid.Column>
            <Grid.Column width={11} className={style.headerRightControls}>
              {headerShowTagsCheckbox}
              {headerAddButton}
            </Grid.Column>
          </Grid.Row>
        )}
        <Grid.Row className={style.topPagination}>
          <Grid.Column textAlign="center">{getPagination()}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign="center">
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
                        <Link
                          href={problem.displayId ? `/problem/${problem.displayId}` : `/problem/by-id/${problem.id}`}
                        >
                          {problem.title}
                        </Link>
                        {!problem.isPublic && (
                          <Label
                            className={style.labelNonPublic}
                            icon="eye slash"
                            size="small"
                            color="red"
                            content={_("problem_set.non_public")}
                          />
                        )}
                        <div className={style.tags} style={{ display: appState.showTagsInProblemSet ? null : "none" }}>
                          {problem.tags.map(tag => (
                            <Label key={tag.id} size="small" content={tag.name} color={tag.color as any} />
                          ))}
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
          </Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign="center">{getPagination()}</Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProblemSetPage = observer(ProblemSetPage);

export default {
  public: route({
    async getView(request) {
      const page = parseInt(request.query.page) || 1;
      const [count, problems, createProblemPermission] = await fetchData(page);
      if (count === null) {
        // TODO: Display an error page
        return null;
      }

      return (
        <ProblemSetPage
          totalCount={count}
          currentPage={page}
          problems={problems}
          createProblemPermission={createProblemPermission}
        />
      );
    }
  })
};

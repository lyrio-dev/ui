import React, { useEffect } from "react";
import { Search, ButtonGroup, Dropdown, Checkbox, Grid, Table, Label } from "semantic-ui-react";
import { mount, route } from "navi";
import { useNavigation, Link } from "react-navi";
import { observer } from "mobx-react";

import style from "./ProblemSetPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import toast from "@/utils/toast";

import Pagination from "@/components/Pagination";

interface ProblemRecord {
  id: number;
  displayId: number;
  title: string;
  submissionCount: number;
  acceptedRate: number;
  tags: {
    id: number;
    name: string;
  }[];
}

async function fetchData(currentPage: number): Promise<[number, ProblemRecord[]]> {
  const { requestError, response } = await ProblemApi.queryProblemSet({
    locale: appState.locale,
    skipCount: PROBLEMS_PER_PAGE * (currentPage - 1),
    takeCount: PROBLEMS_PER_PAGE
  });

  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return [null, null];
  }

  const testTags = ["NOIP", "模板", "图论", "素数", "线段树", "计算几何"];

  function randomTags() {
    const randomTagCount = Math.round(Math.random() * 4);
    return testTags.sort(() => Math.random() - 0.5).filter((_, i) => i <= randomTagCount);
  }

  return [
    response.count,
    response.result.map(item => ({
      id: item.meta.id,
      displayId: item.meta.displayId,
      title: item.title,
      submissionCount: Math.round(Math.random() * 10000),
      acceptedRate: Math.random(),
      tags: randomTags().map((name, id) => ({ id, name }))
    }))
  ];
}

// TODO: Make this a config item, maybe from server?
const PROBLEMS_PER_PAGE = 50;

interface ProblemSetPageProps {
  totalCount: number;
  currentPage: number;
  problems: ProblemRecord[];
}

let ProblemSetPage: React.FC<ProblemSetPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = _("problem_set.title");
  }, [appState.locale]);

  const navigation = useNavigation();

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

  return (
    <>
      <Grid>
        <Grid.Row>
          <Grid.Column width={5}>
            <Search
              className={style.search}
              placeholder={_("problem_set.search_placeholder")}
              input={{ iconPosition: "left" }}
            />
          </Grid.Column>
          <Grid.Column width={11} floated="right" textAlign="right">
            <Checkbox
              className={style.showTags}
              toggle
              checked={appState.showTagsInProblemSet}
              onChange={() => (appState.showTagsInProblemSet = !appState.showTagsInProblemSet)}
              label={_("problem_set.show_tags")}
            />
            <ButtonGroup size="mini">
              <Dropdown labeled button className="icon" icon="plus" text={_("problem_set.add_problem")}>
                <Dropdown.Menu>
                  <Dropdown.Item icon="file" text={_("problem_set.new_problem")} />
                  <Dropdown.Item icon="cloud download" text={_("problem_set.import_problem")} />
                </Dropdown.Menu>
              </Dropdown>
            </ButtonGroup>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row className={style.topPagination}>
          <Grid.Column textAlign="center">{getPagination()}</Grid.Column>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column textAlign="center">
            <Table basic="very" textAlign="center">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell width={1}>#</Table.HeaderCell>
                  <Table.HeaderCell textAlign="left">{_("problem_set.column_title")}</Table.HeaderCell>
                  <Table.HeaderCell />
                  <Table.HeaderCell width={1}>{_("problem_set.column_submission_count")}</Table.HeaderCell>
                  <Table.HeaderCell width={1}>{_("problem_set.column_accepted_rate")}</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {props.problems.map(problem => (
                  <Table.Row className={style.row} key={problem.id}>
                    <Table.Cell>
                      <b>{problem.displayId}</b>
                    </Table.Cell>
                    <Table.Cell textAlign="left">
                      <Link href={`/problem/${problem.displayId}`}>{problem.title}</Link>
                    </Table.Cell>
                    <Table.Cell textAlign="right">
                      <div
                        className={style.tags}
                        style={{ visibility: appState.showTagsInProblemSet ? null : "hidden" }}
                      >
                        {problem.tags.map(tag => (
                          <Label key={tag.id} content={tag.name} />
                        ))}
                      </div>
                    </Table.Cell>
                    <Table.Cell>{problem.submissionCount}</Table.Cell>
                    <Table.Cell>{Math.ceil(problem.acceptedRate * 100 || 0).toFixed(2)}%</Table.Cell>
                  </Table.Row>
                ))}
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

export default mount({
  "/": route({
    async getView(request) {
      const page = parseInt(request.query.page) || 1;
      const [count, problems] = await fetchData(page);
      if (count === null) {
        // TODO: Display an error page
        return null;
      }

      return <ProblemSetPage totalCount={count} currentPage={page} problems={problems} />;
    }
  })
});

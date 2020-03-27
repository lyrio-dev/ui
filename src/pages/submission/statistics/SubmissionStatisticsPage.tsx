import React, { useEffect } from "react";
import { Table, Icon, Button, Segment, Header, Dropdown, Menu } from "semantic-ui-react";
import { useNavigation } from "react-navi";
import { observer } from "mobx-react";
import { Bar, Line } from "react-chartjs-2";
import { FormattedMessage } from "react-intl";

import style from "./SubmissionStatisticsPage.module.less";

import { SubmissionApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import { SubmissionItem, SubmissionHeader } from "../componments/SubmissionItem";
import Pagination from "@/components/Pagination";
import { getScoreColor } from "@/components/ScoreText";
import { defineRoute, RouteError } from "@/AppRouter";

const SUBMISSIONS_PER_PAGE = 10;

export enum SubmissionStatisticsType {
  Fastest = "Fastest",
  MinMemory = "MinMemory",
  MinAnswerSize = "MinAnswerSize",
  Earlist = "Earlist"
}

// We use lower case type in URLs
function getType(type: string): SubmissionStatisticsType {
  return (
    Object.values(SubmissionStatisticsType).find(s => s.toLowerCase() === type.toLowerCase()) ||
    SubmissionStatisticsType.Fastest
  );
}

async function fetchData(id: number, idType: "id" | "displayId", type: SubmissionStatisticsType, page: number) {
  const { requestError, response } = await SubmissionApi.querySubmissionStatistics({
    [idType === "id" ? "problemId" : "problemDisplayId"]: id,
    statisticsType: type,
    locale: appState.locale,
    skipCount: SUBMISSIONS_PER_PAGE * (page - 1),
    takeCount: SUBMISSIONS_PER_PAGE
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error)
    throw new RouteError((<FormattedMessage id={`submission_statistics.error.${response.error}`} />));

  return response;
}

interface SubmissionStatisticsPageProps {
  idType: "id" | "displayId";
  id: number;
  type: SubmissionStatisticsType;
  currentPage: number;
  response: ApiTypes.QuerySubmissionStatisticsResponseDto;
}

let SubmissionStatisticsPage: React.FC<SubmissionStatisticsPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  const idString = props.idType === "id" ? `P${props.id}` : `#${props.id}`;

  useEffect(() => {
    appState.enterNewPage(`${_("submission_statistics.title")} ${idString}`);
  }, [appState.locale]);

  function onPageChange(page: number) {
    navigation.navigate({
      query: {
        page: page.toString()
      }
    });
  }

  const scores: [number, number][] = Object.entries(props.response.scores)
    .filter(([score, count]) => count)
    .map(([score, count]) => [Number(score), Number(count)]);
  const scorePrefixSum = scores.map(x => Array.from(x));
  const scoreSuffixSum = scores.map(x => Array.from(x));
  for (let i = 1; i < scores.length; i++) scorePrefixSum[i][1] += scorePrefixSum[i - 1][1];
  for (let i = scores.length - 2; i >= 0; i--) scoreSuffixSum[i][1] += scoreSuffixSum[i + 1][1];

  // To prevent the most important column to be hidden
  const statisticsField = {
    [SubmissionStatisticsType.Fastest]: "Time",
    [SubmissionStatisticsType.MinMemory]: "Memory",
    [SubmissionStatisticsType.MinAnswerSize]: "AnswerSize",
    [SubmissionStatisticsType.Earlist]: "SubmitTime"
  }[props.type];

  return (
    <>
      <Header as="h1" className={style.header}>
        {_("submission_statistics.header")}
        <Menu compact className={style.headerDropdown}>
          <Dropdown
            simple
            item
            value={props.type}
            options={Object.values(SubmissionStatisticsType).map(type => ({
              key: type,
              value: type,
              text: _(`submission_statistics.type.${type}`),
              onClick: () =>
                navigation.navigate(
                  props.idType === "id"
                    ? `/submissions/statistics/by-id/${props.id}/${type.toLowerCase()}`
                    : `/submissions/statistics/${props.id}/${type.toLowerCase()}`
                )
            }))}
          />
        </Menu>
      </Header>
      {props.response.submissions.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            <Icon name="file" />
            {_("submission_statistics.empty")}
          </Header>
          <Segment.Inline>
            <Button primary onClick={() => navigation.goBack()}>
              {_("submission_statistics.empty_goback")}
            </Button>
          </Segment.Inline>
        </Segment>
      ) : (
        <>
          <Table textAlign="center" basic="very" className={style.table} unstackable fixed>
            <Table.Header>
              <SubmissionHeader page="statistics" statisticsField={statisticsField as any} />
            </Table.Header>
            <Table.Body>
              {props.response.submissions.map(submission => {
                return (
                  <SubmissionItem
                    key={submission.id}
                    submission={submission}
                    page="statistics"
                    statisticsField={statisticsField as any}
                  />
                );
              })}
            </Table.Body>
          </Table>
          {props.response.count <= SUBMISSIONS_PER_PAGE ? null : (
            <Pagination
              totalCount={props.response.count}
              currentPage={props.currentPage}
              itemsPerPage={SUBMISSIONS_PER_PAGE}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
      {scores.length > 0 && (
        <>
          <Header as="h1" textAlign="center" className={style.headerChart}>
            {_("submission_statistics.header_score_distribution")}
          </Header>
          <div className={style.chartContainer}>
            <Bar
              options={{
                tooltips: {
                  xPadding: 10,
                  yPadding: 10,
                  displayColors: false,
                  titleFontSize: 13,
                  bodyFontSize: 13,
                  titleFontStyle: "",
                  callbacks: {
                    title: tooltip =>
                      tooltip.length === 1 ? _("submission_statistics.chart_tooltip.score") + tooltip[0].label : "",
                    label: tooltip => _("submission_statistics.chart_tooltip.count") + tooltip.value
                  }
                },
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                        padding: 10,
                        maxTicksLimit: 5,
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        drawBorder: false,
                        color: "#ccc"
                      }
                    }
                  ],
                  xAxes: [
                    {
                      ticks: {
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        display: false
                      }
                    }
                  ]
                },
                maintainAspectRatio: false,
                legend: {
                  display: false
                }
              }}
              data={{
                labels: scores.map(([score, count]) => score),
                datasets: [
                  {
                    data: scores.map(([score, count]) => count),
                    backgroundColor: scores.map(([score, count]) => getScoreColor(score))
                  }
                ]
              }}
            />
          </div>
          <Header as="h1" textAlign="center" className={style.headerChart}>
            {_("submission_statistics.header_score_prefix_sum")}
          </Header>
          <div className={style.chartContainer}>
            <Line
              options={{
                tooltips: {
                  xPadding: 10,
                  yPadding: 10,
                  displayColors: false,
                  titleFontSize: 13,
                  bodyFontSize: 13,
                  titleFontStyle: "",
                  callbacks: {
                    title: tooltip =>
                      tooltip.length === 1
                        ? _("submission_statistics.chart_tooltip.score") + "≤ " + tooltip[0].label
                        : "",
                    label: tooltip => _("submission_statistics.chart_tooltip.count") + tooltip.value
                  }
                },
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                        padding: 10,
                        maxTicksLimit: 5,
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        drawBorder: false,
                        color: "#ccc"
                      }
                    }
                  ],
                  xAxes: [
                    {
                      ticks: {
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        display: false
                      }
                    }
                  ]
                },
                maintainAspectRatio: false,
                legend: {
                  display: false
                }
              }}
              data={{
                labels: scorePrefixSum.map(([score, count]) => score),
                datasets: [
                  {
                    data: scorePrefixSum.map(([score, count]) => count),
                    pointBackgroundColor: scorePrefixSum.map(([score, count]) => getScoreColor(score)),
                    backgroundColor: "rgba(11, 98, 164, 0.08)",
                    borderColor: "#0b62a4",
                    pointBorderColor: "#fff",
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointHitRadius: 30
                  }
                ]
              }}
            />
          </div>
          <Header as="h1" textAlign="center" className={style.headerChart}>
            {_("submission_statistics.header_score_suffix_sum")}
          </Header>
          <div className={style.chartContainer}>
            <Line
              options={{
                tooltips: {
                  xPadding: 10,
                  yPadding: 10,
                  displayColors: false,
                  titleFontSize: 13,
                  bodyFontSize: 13,
                  titleFontStyle: "",
                  callbacks: {
                    title: tooltip =>
                      tooltip.length === 1
                        ? _("submission_statistics.chart_tooltip.score") + "≥ " + tooltip[0].label
                        : "",
                    label: tooltip => _("submission_statistics.chart_tooltip.count") + tooltip.value
                  }
                },
                scales: {
                  yAxes: [
                    {
                      ticks: {
                        beginAtZero: true,
                        padding: 10,
                        maxTicksLimit: 5,
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        drawBorder: false,
                        color: "#ccc"
                      }
                    }
                  ],
                  xAxes: [
                    {
                      ticks: {
                        fontSize: 13,
                        fontColor: "#888"
                      },
                      gridLines: {
                        display: false
                      }
                    }
                  ]
                },
                maintainAspectRatio: false,
                legend: {
                  display: false
                }
              }}
              data={{
                labels: scoreSuffixSum.map(([score, count]) => score),
                datasets: [
                  {
                    data: scoreSuffixSum.map(([score, count]) => count),
                    pointBackgroundColor: scoreSuffixSum.map(([score, count]) => getScoreColor(score)),
                    backgroundColor: "rgba(11, 98, 164, 0.08)",
                    borderColor: "#0b62a4",
                    pointBorderColor: "#fff",
                    pointRadius: 4,
                    pointHoverRadius: 8,
                    pointHitRadius: 30
                  }
                ]
              }}
            />
          </div>
        </>
      )}
    </>
  );
};

SubmissionStatisticsPage = observer(SubmissionStatisticsPage);

export default {
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]) || 0;

    const type = getType(request.params["type"]);
    let currentPage = parseInt(request.params.page) || 1;
    if (currentPage < 1) currentPage = 1;

    const response = await fetchData(id, "id", type, currentPage);

    return <SubmissionStatisticsPage id={id} idType="id" type={type} currentPage={currentPage} response={response} />;
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]) || 0;

    const type = getType(request.params["type"]);
    let currentPage = parseInt(request.params.page) || 1;
    if (currentPage < 1) currentPage = 1;

    const response = await fetchData(displayId, "displayId", type, currentPage);

    return (
      <SubmissionStatisticsPage
        id={displayId}
        idType="displayId"
        type={type}
        currentPage={currentPage}
        response={response}
      />
    );
  })
};

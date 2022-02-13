import React, { useEffect } from "react";
import { Table, Icon, Button, Segment, Header, Dropdown, Menu } from "semantic-ui-react";
import { observer } from "mobx-react";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  BarElement,
  Tooltip
} from "chart.js";
import { v4 as uuid } from "uuid";

import style from "./SubmissionStatisticsPage.module.less";

import api from "@/api";
import { appState } from "@/appState";
import { useLocalizer, useNavigationChecked, useScreenWidthWithin } from "@/utils/hooks";
import {
  SubmissionItem,
  SubmissionHeader,
  SubmissionHeaderMobile,
  SubmissionItemMobile
} from "../componments/SubmissionItem";
import { Pagination } from "@/components/Pagination";
import { getScoreColor } from "@/components/ScoreText";
import { defineRoute, RouteError } from "@/AppRouter";
import { getProblemIdString } from "@/pages/problem/utils";
import { makeToBeLocalizedText } from "@/locales";

ChartJS.register(BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip);

const SUBMISSIONS_PER_PAGE = appState.serverPreference.pagination.submissionStatistics;

export enum SubmissionStatisticsType {
  Fastest = "Fastest",
  MinMemory = "MinMemory",
  MinAnswerSize = "MinAnswerSize",
  Earliest = "Earliest"
}

// We use lower case type in URLs
function getType(type: string): SubmissionStatisticsType {
  return (
    Object.values(SubmissionStatisticsType).find(s => s.toLowerCase() === type.toLowerCase()) ||
    SubmissionStatisticsType.Fastest
  );
}

async function fetchData(id: number, idType: "id" | "displayId", type: SubmissionStatisticsType, page: number) {
  const { requestError, response } = await api.submission.querySubmissionStatistics({
    [idType === "id" ? "problemId" : "problemDisplayId"]: id,
    statisticsType: type,
    locale: appState.locale,
    skipCount: SUBMISSIONS_PER_PAGE * (page - 1),
    takeCount: SUBMISSIONS_PER_PAGE
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`submission_statistics.error.${response.error}`));

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
  const _ = useLocalizer("submission_statistics");
  const navigation = useNavigationChecked();

  const idString = getProblemIdString(props.id, { use: props.idType });

  useEffect(() => {
    appState.enterNewPage(`${_(".title")} ${idString}`, "problem_set");
  }, [appState.locale, props.id, props.idType]);

  const scores: [number, number][] = Object.entries(props.response.scores)
    .filter(([score, count]) => count)
    .map(([score, count]) => [Number(score), Number(count)]);
  const scorePrefixSum = scores.map(x => Array.from(x));
  const scoreSuffixSum = scores.map(x => Array.from(x));
  for (let i = 1; i < scores.length; i++) scorePrefixSum[i][1] += scorePrefixSum[i - 1][1];
  for (let i = scores.length - 2; i >= 0; i--) scoreSuffixSum[i][1] += scoreSuffixSum[i + 1][1];

  const isMobile = useScreenWidthWithin(0, 768);
  const importantField =
    props.type === SubmissionStatisticsType.Fastest
      ? "timeUsed"
      : props.type === SubmissionStatisticsType.MinMemory
      ? "memoryUsed"
      : null;

  return (
    <>
      <Header as="h1" className={style.header}>
        {_(".header")}
        <Menu compact className={style.headerDropdown}>
          <Dropdown
            simple
            item
            value={props.type}
            options={Object.values(SubmissionStatisticsType).map(type => ({
              key: type,
              value: type,
              text: _(`.type.${type}`),
              onClick: () => navigation.navigate(type.toLowerCase())
            }))}
          />
        </Menu>
      </Header>
      {props.response.submissions.length === 0 ? (
        <Segment placeholder>
          <Header icon>
            <Icon name="file" />
            {_(".empty")}
          </Header>
          <Segment.Inline>
            <Button primary onClick={() => navigation.goBack()}>
              {_(".empty_goback")}
            </Button>
          </Segment.Inline>
        </Segment>
      ) : (
        <>
          <Table textAlign="center" basic="very" className={style.table} unstackable fixed>
            <Table.Header>
              {isMobile ? (
                <SubmissionHeaderMobile importantField={importantField} />
              ) : (
                <SubmissionHeader page="statistics" />
              )}
            </Table.Header>
            <Table.Body>
              {props.response.submissions.map(submission => {
                return isMobile ? (
                  <SubmissionItemMobile key={submission.id} submission={submission} importantField={importantField} />
                ) : (
                  <SubmissionItem key={submission.id} submission={submission} page="statistics" />
                );
              })}
            </Table.Body>
          </Table>
          {props.response.count <= SUBMISSIONS_PER_PAGE ? null : (
            <div className={style.pagination}>
              <Pagination
                totalCount={props.response.count}
                currentPage={props.currentPage}
                itemsPerPage={SUBMISSIONS_PER_PAGE}
                pageUrl={page => ({
                  query: {
                    page: page.toString()
                  }
                })}
              />
            </div>
          )}
        </>
      )}
      {scores.length > 0 && (
        <>
          <Header as="h1" textAlign="center" className={style.headerChart}>
            {_(".header_score_distribution")}
          </Header>
          <div className={style.chartContainer}>
            <Bar
              options={{
                plugins: {
                  tooltip: {
                    padding: 10,
                    displayColors: false,
                    titleFont: {
                      size: 13,
                      style: "initial"
                    },
                    bodyFont: {
                      size: 13
                    },
                    callbacks: {
                      title: tooltip => (tooltip.length === 1 ? _(".chart_tooltip.score") + tooltip[0].label : ""),
                      label: tooltip => _(".chart_tooltip.count") + tooltip.formattedValue
                    }
                  },
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      padding: 10,
                      maxTicksLimit: 5,
                      font: {
                        size: 13
                      },
                      color: "#888"
                    },
                    grid: {
                      drawBorder: false,
                      color: "#ccc"
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 13
                        // color: "#888"
                      }
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                maintainAspectRatio: false
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
            {_(".header_score_prefix_sum")}
          </Header>
          <div className={style.chartContainer}>
            <Line
              options={{
                plugins: {
                  tooltip: {
                    padding: 10,
                    displayColors: false,
                    titleFont: {
                      size: 13,
                      style: "initial"
                    },
                    bodyFont: {
                      size: 13
                    },
                    callbacks: {
                      title: tooltip =>
                        tooltip.length === 1 ? _(".chart_tooltip.score") + "≤ " + tooltip[0].label : "",
                      label: tooltip => _(".chart_tooltip.count") + tooltip.formattedValue
                    }
                  },
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      padding: 10,
                      maxTicksLimit: 5,
                      font: {
                        size: 13
                      },
                      color: "#888"
                    },
                    grid: {
                      drawBorder: false,
                      color: "#ccc"
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 13
                      },
                      color: "#888"
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                maintainAspectRatio: false
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
            {_(".header_score_suffix_sum")}
          </Header>
          <div className={style.chartContainer}>
            <Line
              options={{
                plugins: {
                  tooltip: {
                    padding: 10,
                    displayColors: false,
                    titleFont: {
                      size: 13,
                      style: "initial"
                    },
                    bodyFont: {
                      size: 13
                    },
                    callbacks: {
                      title: tooltip =>
                        tooltip.length === 1 ? _(".chart_tooltip.score") + "≥ " + tooltip[0].label : "",
                      label: tooltip => _(".chart_tooltip.count") + tooltip.formattedValue
                    }
                  },
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      padding: 10,
                      maxTicksLimit: 5,
                      font: {
                        size: 13
                      },
                      color: "#888"
                    },
                    grid: {
                      drawBorder: false,
                      color: "#ccc"
                    }
                  },
                  x: {
                    ticks: {
                      font: {
                        size: 13
                      },
                      color: "#888"
                    },
                    grid: {
                      display: false
                    }
                  }
                },
                maintainAspectRatio: false
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
        key={uuid()}
        id={displayId}
        idType="displayId"
        type={type}
        currentPage={currentPage}
        response={response}
      />
    );
  })
};

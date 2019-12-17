import React, { useEffect, useState } from "react";
import { Row, Col, Table, message } from "antd";

import style from "./ProblemSetPage.module.less";

import { ProblemApi } from "@/api";
import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";

interface ProblemRecord {
  id: number;
  displayId: number;
  title: string;
  submissionCount: number;
  acceptedRate: number;
}

// TODO: Make this a config item, maybe from server?
const PROBLEMS_PER_PAGE = 50;

const ProblemSetPage: React.FC = () => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = _("problem_set.title");
  }, []);

  const [problems, setProblems] = useState<ProblemRecord[]>();
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { requestError, response } = await ProblemApi.queryProblemSet({
        locale: appState.locale,
        skipCount: PROBLEMS_PER_PAGE * (currentPage - 1),
        takeCount: PROBLEMS_PER_PAGE
      });
      setLoading(false);

      if (requestError || response.error) return message.error(requestError || response.error);

      setTotalCount(response.count);
      setProblems(
        response.result.map(item => ({
          id: item.meta.id,
          displayId: item.meta.displayId,
          title: item.title,
          submissionCount: Math.round(Math.random() * 10000),
          acceptedRate: Math.random()
        }))
      );
    })();
  }, [currentPage, appState.locale]);

  return (
    <div className={style.wrapper}>
      <Row>
        <Col span={17}>
          <div className={style.tableWrapper}>
            <Table<ProblemRecord>
              dataSource={problems}
              loading={loading}
              rowKey={record => record.displayId.toString()}
              pagination={{
                total: totalCount,
                current: currentPage,
                pageSize: PROBLEMS_PER_PAGE,
                onChange: setCurrentPage
              }}
            >
              <Table.Column title="#" dataIndex="displayId" key="displayId" width={60} align="center" />
              <Table.Column title={_("problem_set.column_title")} dataIndex="title" key="title" />
              <Table.Column
                title={_("problem_set.column_submission_count")}
                dataIndex="submissionCount"
                key="submissionCount"
                width={100}
                align="center"
              />
              <Table.Column
                title={_("problem_set.column_accepted_rate")}
                dataIndex="acceptedRate"
                key="acceptedRate"
                render={(rate: number) => (rate * 100).toFixed(2) + "%"}
                width={100}
                align="center"
              />
            </Table>
          </div>
        </Col>
        <Col span={16}></Col>
      </Row>
    </div>
  );
};

export default ProblemSetPage;

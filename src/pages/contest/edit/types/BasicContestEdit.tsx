import React from "react";
import { Checkbox, Header, Icon, Input, Popup, Select, Table } from "semantic-ui-react";

import style from "../ContestEditPage.module.less";

import { useLocalizer } from "@/utils/hooks";

import {
  ContestTypeEdit,
  ContestTypeInjectedOptionListItemsProps,
  ContestTypeInjectedProblemTableColumnsProps
} from "../common/interface";
import { parseNumber } from "@/utils/safeParseNumber";
import toast from "@/utils/toast";

interface BasicContestTypeOptionsProblemConfig {
  fullScore: number;
  fullScoreCodeforcesDecreasing: boolean;
}

const defaultProblemConfig: BasicContestTypeOptionsProblemConfig = {
  fullScore: 100,
  fullScoreCodeforcesDecreasing: false
};

interface BasicContestTypeOptions {
  problemConfig: Record<number, BasicContestTypeOptionsProblemConfig>;
  useBestSubmission: boolean; // Otherwise use latest ***valid*** submission
}

const BasicContestTypeInjectedOptionListItems: React.FC<ContestTypeInjectedOptionListItemsProps<BasicContestTypeOptions>> = props => {
  const _ = useLocalizer("contest_edit.type.basic");

  return props.type === "Inputs" && (
    <>
      {
        <div>
          <Header className={style.fieldHeader} size="tiny" content={_(".use_which_submission._")} />
          <Select
            fluid
            value={!!props.contestTypeOptions.useBestSubmission}
            onChange={(_, { value }) => props.updateContestTypeOptions({ key: "useBestSubmission", value: value as boolean })}
            options={[
              {
                key: true,
                value: true,
                text: _(".use_which_submission.best")
              },
              {
                key: false,
                value: false,
                text: _(".use_which_submission.latest")
              }
            ]}
          />
        </div>
      }
    </>
  );
};

const BasicContestTypeInjectedProblemTableColumns: React.FC<
  ContestTypeInjectedProblemTableColumnsProps<BasicContestTypeOptions>
> = props => {
  const _ = useLocalizer("contest_edit.type.basic");

  const p = props.problem?.problem?.id;
  const problemConfig = props.contestTypeOptions.problemConfig[p];

  const updateProblemConfig = (delta: Partial<BasicContestTypeOptionsProblemConfig>) =>
    props.updateContestTypeOptions({
      key: "problemConfig",
      value: {
        ...props.contestTypeOptions.problemConfig,
        [p]: {
          ...(problemConfig || defaultProblemConfig),
          ...delta
        }
      }
    });

  return !p ? (
    <>
      <Table.HeaderCell textAlign="center" className={style.minWidth} children={_(".full_score")} />
      <Table.HeaderCell textAlign="center" className={style.minWidth}>
        {_(".full_score_decreasing")}
        <Popup
          trigger={<Icon name="question circle" className={style.rightIcon} />}
          content={
            <span dangerouslySetInnerHTML={{ __html: _(".full_score_decreasing_notes") }} />
          }
          position="top right"
          on="hover"
          hoverable
        />
      </Table.HeaderCell>
    </>
  ) : (
    <>
      <Table.Cell textAlign="center" className={style.autoGrowInputColumn}>
        <div data-value={problemConfig?.fullScore ?? ""}>
          <Input
            transparent
            fluid
            value={problemConfig?.fullScore ?? ""}
            placeholder="100"
            onChange={(_, { value }) =>
              (value.length === 0 || !isNaN(parseNumber(value))) &&
              updateProblemConfig({ fullScore: value.length === 0 ? null : parseNumber(value) })
            }
          />
        </div>
      </Table.Cell>
      <Table.Cell textAlign="center">
        <Checkbox toggle checked={problemConfig?.fullScoreCodeforcesDecreasing} onChange={(_, { checked }) => updateProblemConfig({ fullScoreCodeforcesDecreasing: checked })} />
      </Table.Cell>
    </>
  );
};

const BasicContestTypeEditInterface: ContestTypeEdit<BasicContestTypeOptions> = {
  overriddenContestOptions: {
    freezeRanklistForParticipantsWhen: 0
  },
  defaultContestTypeOptions: {
    problemConfig: {},
    useBestSubmission: false
  },
  ContestTypeInjectedOptionListItems: BasicContestTypeInjectedOptionListItems,
  ContestTypeInjectedProblemTableColumns: BasicContestTypeInjectedProblemTableColumns,
  normalizeTypeOptions: (typeOptions, problems) => ({
    ...typeOptions,
    problemConfig: Object.fromEntries(
      problems
        .map(({ problem }) => problem.id)
        .map(id => [id, typeOptions.problemConfig[id] || defaultProblemConfig] as const)
        .map(([id, options]) => [id, ({ ...options, fullScore: options.fullScore ?? 100 })])
    )
  }),
  validate: (typeOptions, problems, _) => {
    for (const [i, { problem: { id } }] of problems.entries()) {
      const { fullScore } = typeOptions.problemConfig[id] || defaultProblemConfig;
      if (fullScore <= 0 || fullScore > 100000) {
        toast.error(_(".errors.problem_full_score_invalid", { index: i + 1, score: fullScore }));
        return false;
      }
    }

    return true;
  }
};

export default BasicContestTypeEditInterface;

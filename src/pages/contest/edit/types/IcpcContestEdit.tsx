import React from "react";
import { Header, Input } from "semantic-ui-react";

import style from "../ContestEditPage.module.less";

import { useLocalizer } from "@/utils/hooks";

import {
  ContestTypeEdit,
  ContestTypeInjectedOptionListItemsProps,
  ContestTypeInjectedProblemTableColumnsProps
} from "../common/interface";
import { parseNumber } from "@/utils/safeParseNumber";

interface IcpcContestTypeOptions {
  penaltyTime: number;
}

const IcpcContestTypeInjectedOptionListItems: React.FC<ContestTypeInjectedOptionListItemsProps<IcpcContestTypeOptions>> = props => {
  const _ = useLocalizer("contest_edit.type.icpc");

  return props.type === "Inputs" && (
    <>
      {
        <div>
          <Header className={style.fieldHeader} size="tiny" content={_(".penalty_time._")} />
          <Input
            fluid
            type="number"
            value={props.contestTypeOptions.penaltyTime == null ? "" : Math.floor(props.contestTypeOptions.penaltyTime / 60)}
            onChange={e => parseNumber(e.target.value, x => (!x || x >= 0) && props.updateContestTypeOptions({ key: "penaltyTime", value: x ? x * 60 : null }), true)}
            labelPosition="right"
            label={_(".penalty_time.minutes")}
            placeholder={_(".penalty_time.placeholder")}
            min="0"
            max={Math.floor(props.contestDuration / 60)}
          />
        </div>
      }
    </>
  );
};

const IcpcContestTypeInjectedProblemTableColumns: React.FC<
  ContestTypeInjectedProblemTableColumnsProps<IcpcContestTypeOptions>
> = () => null;

const IcpcContestTypeEditInterface: ContestTypeEdit<IcpcContestTypeOptions> = {
  overriddenContestOptions: {
    submissionMetaVisibility: "Visible",
    runPretestsOnly: false,
    ranklistDuringContest: "Real"
  },
  defaultContestTypeOptions: {
    penaltyTime: 20 * 60
  },
  ContestTypeInjectedOptionListItems: IcpcContestTypeInjectedOptionListItems,
  ContestTypeInjectedProblemTableColumns: IcpcContestTypeInjectedProblemTableColumns,
  normalizeTypeOptions: (typeOptions, problems) => typeOptions,
  validate: (typeOptions, problems, _) => true
};

export default IcpcContestTypeEditInterface;

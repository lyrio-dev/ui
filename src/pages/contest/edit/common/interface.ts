import React from "react";

import { Localizer } from "@/locales";

import { ContestProblem } from "../ContestEditPage";

export interface ContestTypeOptionsEditViewCommonProps<ContestTypeOptions> {
  contestOptions: ApiTypes.ContestOptionsDto;
  contestDuration: number; // in seconds
  contestTypeOptions: ContestTypeOptions;
  updateContestTypeOptions: <T extends keyof ContestTypeOptions>(action: {
    key: T;
    value: ContestTypeOptions[T];
  }) => void;
}

export interface ContestTypeInjectedOptionListItemsProps<ContestTypeOptions>
  extends ContestTypeOptionsEditViewCommonProps<ContestTypeOptions> {
  type: "Checkboxes" | "Inputs";
}

export interface ContestTypeInjectedProblemTableColumnsProps<ContestTypeOptions>
  extends ContestTypeOptionsEditViewCommonProps<ContestTypeOptions> {
  /**
   * `null` for table head.
   */
  problem?: ContestProblem;
}

export interface ContestTypeEdit<ContestTypeOptions> {
  overriddenContestOptions: Partial<ApiTypes.ContestOptionsDto>;
  defaultContestTypeOptions: ContestTypeOptions;
  ContestTypeInjectedOptionListItems: React.FC<ContestTypeInjectedOptionListItemsProps<ContestTypeOptions>>;
  ContestTypeInjectedProblemTableColumns: React.FC<ContestTypeInjectedProblemTableColumnsProps<ContestTypeOptions>>;
  normalizeTypeOptions: (contestTypeOptions: ContestTypeOptions, problems: ContestProblem[]) => ContestTypeOptions;
  validate: (contestTypeOptions: ContestTypeOptions, problems: ContestProblem[], _: Localizer) => boolean; // after normalize
}

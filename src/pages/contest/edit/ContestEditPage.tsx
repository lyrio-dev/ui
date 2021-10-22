import React, { useEffect, useReducer, useState } from "react";
import { Button, Checkbox, Grid, Header, Input, List, Popup, Radio, Select, Table } from "semantic-ui-react";
import update from "immutability-helper";
import dayjs from "dayjs";

import style from "./ContestEditPage.module.less";

import { Link, useAsyncCallbackPending, useConfirmNavigation, useLocalizer, useNavigationChecked, useSensitiveState } from "@/utils/hooks";
import { appState } from "@/appState";
import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import { makeToBeLocalizedText } from "@/locales";
import { LocalizeTab } from "@/components/LocalizeTab";
import { Locale } from "@/interfaces/Locale";
import { DiscussionEditor } from "@/pages/discussion/view/DiscussionViewPage";
import { getContestUrl } from "../utils";
import { getProblemDisplayName, getProblemUrl } from "@/pages/problem/utils";
import ProblemSearch from "@/components/ProblemSearch";
import { parseNumber, safeParseNumber } from "@/utils/safeParseNumber";
import toast from "@/utils/toast";

import { ContestType } from "./common/ContestType";
import { ContestTypeEdit, ContestTypeOptionsEditViewCommonProps } from "./common/interface";

import BasicContestTypeEditInterface from "./types/BasicContestEdit";
import IcpcContestTypeEditInterface from "./types/IcpcContestEdit";

const contestTypeEditInterfaces: Record<ContestType, ContestTypeEdit<any>> = {
  [ContestType.Basic]: BasicContestTypeEditInterface,
  [ContestType.ICPC]: IcpcContestTypeEditInterface as any
};

function dateToLocalISOString(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
}

export interface ContestProblem {
  problem: ApiTypes.ProblemMetaDto;
  alias: string;
}

interface ContestEditPageProps {
  response?: ApiTypes.GetContestEditDataResponseDto;
}

const ContestEditPage: React.FC<ContestEditPageProps> = props => {
  const _ = useLocalizer("contest_edit");
  const navigation = useNavigationChecked();

  const isNew = !props.response;

  useEffect(() => {
    appState.enterNewPage(_(isNew ? ".title_new" : ".title_edit"), "contests", false);
  }, [appState.locale]);

  const getDefaultLocalizedContent = (locale: Locale) => ({ locale, name: "", description: "" });

  const [modified, setModified] = useConfirmNavigation();
  const [localizedContents, setLocalizedContents] = useSensitiveState(setModified, 
    (props.response
      ? Object.fromEntries(props.response.localizedContents.map(l => [l.locale, l]))
      : { [appState.locale]: getDefaultLocalizedContent(appState.locale) }) as Record<
      Locale,
      ApiTypes.ContestLocalizedContentDto
    >
  );
  const [type, setType] = useSensitiveState(setModified, props.response?.contest?.type as ContestType || ContestType.Basic);
  const [startTime, setStartTime] = useSensitiveState(setModified, 
    dateToLocalISOString(props.response ? new Date(props.response.contest.startTime) : new Date())
  );
  const [endTime, setEndTime] = useSensitiveState(setModified, 
    dateToLocalISOString(props.response ? new Date(props.response.contest.endTime) : new Date())
  );
  const [enableParticipantDuration, setEnableParticipantDuration] = useSensitiveState(setModified, 
    !!props.response?.contest?.participantDuration
  );
  const [participantDuration, setParticipantDuration] = useSensitiveState(setModified, props.response?.contest?.participantDuration || null);
  const [publicness, setPublicness] = useSensitiveState(setModified, props.response?.contest?.publicness || "PublicParticipation");

  const [moveProblemWithAlias, setMoveProblemWithAlias] = useState(false);
  const [problems, setProblems] = useState<ContestProblem[]>(
    (props.response?.problems || []).map((problem, i) => ({ problem, alias: props.response.contest.problems[i].alias }))
  );

  function moveProblem(i: number, direction: -1 | 1) {
    setModified(true);

    const j = i + direction;
    setProblems(p => {
      const pi = { ...p[i] },
        pj = { ...p[j] };
      if (!moveProblemWithAlias) [pi.alias, pj.alias] = [pj.alias, pi.alias];
      return p.map((curr, index) => (index === i ? pj : index === j ? pi : curr));
    });
  }

  function deleteProblem(i: number) {
    setModified(true);

    setProblems(p => p.filter((_, index) => index !== i));
  }

  function addProblem(problem: ApiTypes.ProblemMetaDto) {
    setModified(true);

    setProblems(p => {
      function nextAlias() {
        if (p.length === 0) return "A";

        const lastAlias = p[p.length - 1].alias;
        const [isNumber, x] = safeParseNumber(lastAlias);

        function nextNumber(x: number) {
          for (let i = x + 1; ; i++) if (p.every(({ alias }) => alias !== String(i))) return String(i);
        }

        if (isNumber) return nextNumber(x);

        if (lastAlias.length === 1) {
          // Single alphabet
          const code = lastAlias.codePointAt(0);
          const a = 97,
            z = 122,
            A = 65,
            Z = 90;
          const end = code >= a ? z : code >= A ? Z : -1;
          for (let i = code + 1; i <= end; i++)
            if (p.every(({ alias }) => alias !== String.fromCharCode(i))) return String.fromCharCode(i);
        }

        // Find a non-used number
        return nextNumber(0);
      }

      return [...p, { problem, alias: nextAlias() }];
    });
  }

  function onChangeProblemAlias(i: number, newAlias: string) {
    setModified(true);
    setProblems(p => p.map((problem, index) => (index === i ? { ...problem, alias: newAlias } : problem)));
  }

  function checkProblemAliases() {
    for (const [i, p] of problems.entries()) {
      if (!p.alias) {
        toast.error(_(".errors.empty_alias", { index: i + 1 }));
        return false;
      }

      for (const [j, q] of problems.entries()) {
        if (i !== j && p.alias === q.alias) {
          toast.error(_(".errors.duplicated_alias", { index: i + 1, index2: j + 1 }));
          return false;
        }
      }
    }

    return true;
  }

  const ContestTypeEditInterface = contestTypeEditInterfaces[type];

  const [_contestOptions, updateContestOptions] = useReducer(
    <T extends keyof ApiTypes.ContestOptionsDto>(
      state: ApiTypes.ContestOptionsDto,
      { key, value }: { key: T; value: ApiTypes.ContestOptionsDto[T] }
    ) => { setModified(true); return ({ ...state, [key]: value }) },
    props.response?.contest?.contestOptions || {
      allowSeeingProblemTags: false,
      allowAccessingTestData: false,
      allowSeeingOthersSubmissions: false,
      allowSeeingOthersSubmissionDetail: false,
      submissionMetaVisibility: "PretestsOnly",
      submissionTestcaseResultVisibility: "Hidden",
      submissionTestcaseDetailVisibility: "Hidden",
      showProblemStatistics: true,
      enableIssues: true,
      runPretestsOnly: false,
      ranklistDuringContest: "Pretests",
      freezeRanklistForParticipantsWhen: 0
    }
  );
  const contestOptions = { ..._contestOptions, ...ContestTypeEditInterface.overriddenContestOptions };

  const defaultContestTypeOptions = props.response?.contest?.type === type ? props.response?.contest?.contestTypeOptions : ContestTypeEditInterface.defaultContestTypeOptions;
  const [contestTypeOptions, setContestTypeOptions] = useState<any>(defaultContestTypeOptions);
  useEffect(() => {
    setModified(true);
    setContestTypeOptions(defaultContestTypeOptions);
  }, [type]);

  function updateContestTypeOptions({ key, value }: { key: any; value: unknown }) {
    setModified(true);
    setContestTypeOptions((state: any) => ({ ...state, [key]: value }));
  }

  const [pending, submit] = useAsyncCallbackPending(async () => {
    if (!checkProblemAliases()) return;
    if (!ContestTypeEditInterface.validate(contestTypeOptions, problems, _)) return;

    const contestInformation: ApiTypes.ContestInformationDto = {
      type,
      localizedContents: Object.values(localizedContents),
      startTime,
      endTime,
      participantDuration: enableParticipantDuration ? participantDuration : 0,
      publicness,
      problems: problems.map(({ problem: { id: problemId }, alias }) => ({ problemId, alias })),
      contestOptions,
      contestTypeOptions
    };

    if (props.response) {
      const contestId = props.response.contest.id;
      const { requestError, response } = await api.contest.updateContest({ contestId, contestInformation });
      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(_(`.errors.${response.error}`));
      else {
        toast.success(_(".success_update"));
        setModified(false);
        navigation.navigate(getContestUrl(contestId));
      }
    } else {
      const { requestError, response } = await api.contest.createContest({ contestInformation });
      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(_(`.errors.${response.error}`));
      else {
        toast.success(_(".success_create"));
        setModified(false);
        navigation.navigate(getContestUrl(response.contestId));
      }
    }
  });

  const contestDuration = enableParticipantDuration ? participantDuration : dayjs(endTime).diff(startTime, "s");
  const contestTypeEditProps: ContestTypeOptionsEditViewCommonProps<any> = {
    contestOptions,
    contestDuration,
    contestTypeOptions,
    updateContestTypeOptions
  };

  return (
    <>
      <Grid>
        <Grid.Column width={4} className={style.left}>
          <Header as="h1" content={props.response ? _(".header_edit", { id: props.response.contest.id }) : _(".header_new")} icon="edit" className="withIcon" />
          <Header className={style.fieldHeader} size="tiny" content={_(".header_type")} />
          <Select
            fluid
            value={type}
            onChange={(e, { value }) => setType(value as any)}
            disabled={!!props.response}
            options={(Object.values(ContestType)).map(t => ({
              key: t,
              value: t,
              text: _(`.type.${t.toLowerCase()}.name`)
            }))}
          />
          <div className={style.notes} children={_(".type_notes")} />
          <Header className={style.fieldHeader} size="tiny" content={_(".header_start_time")} />
          <Input fluid type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
          <Header className={style.fieldHeader} size="tiny" content={_(".header_end_time")} />
          <Input fluid type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} />
          <Checkbox
            className={style.checkbox}
            checked={enableParticipantDuration}
            onChange={(e, { checked }) => setEnableParticipantDuration(checked)}
            label={_(".enable_participant_duration")}
          />
          {enableParticipantDuration && (
            <>
              <Input
                className={style.participantDurationMinutes}
                fluid
                type="number"
                value={participantDuration == null ? "" : Math.floor(participantDuration / 60)}
                onChange={e => parseNumber(e.target.value, x => (!x || x > 0) && setParticipantDuration(x ? x * 60 : null), true)}
                labelPosition="right"
                label={_(".participant_duration_unit_minutes")}
                placeholder={_(".participant_duration_placeholder")}
                min="0"
                max={Math.floor(dayjs(endTime).diff(startTime, "m"))}
              />
              <div className={style.notes}>
                <List
                  bulleted
                  items={_(".participant_duration_notes")
                    .split("\n")
                    .map((s, i) => ({ key: i, content: s }))}
                />
              </div>
            </>
          )}
          <Header className={style.fieldHeader} size="tiny" content={_(".header_publicness")} />
          <div className={style.radios}>
            {(["PublicParticipation", "PublicViewAfterEnded", "Hidden"] as typeof publicness[]).map(p => (
              <Radio
                key={p}
                checked={publicness === p}
                onChange={(_, { checked }) => checked && setPublicness(p)}
                label={_(`.publicness.${p}`)}
              />
            ))}
          </div>
          <div className={style.buttons}>
            <Button
              as={Link}
              content={_(".button_back")}
              disabled={pending}
              href={props.response ? getContestUrl(props.response.contest) : "/c"}
            />
            <Button primary content={_(".button_submit")} loading={pending} onClick={submit} />
          </div>
        </Grid.Column>
        <Grid.Column width={12}>
          <LocalizeTab
            localizedContents={localizedContents}
            setLocalizedContents={setLocalizedContents}
            setModified={setModified}
            item={(locale, content, setDefaultLocale, deleteLocale) => (
              <>
                <div className={style.nameEditor}>
                  <Input
                    value={content.name}
                    placeholder={_(".placeholder_name")}
                    onChange={(_, { value }) => {
                      setModified(true);
                      setLocalizedContents(
                        update(localizedContents, {
                          [locale]: {
                            name: { $set: value }
                          }
                        })
                      );
                    }}
                  />
                  {setDefaultLocale && <Button content={_(".set_default_locale")} onClick={setDefaultLocale} />}
                  {deleteLocale && (
                    <Popup
                      trigger={<Button negative content={_(".delete_locale")} />}
                      content={<Button negative content={_(".confirm_delete_locale")} onClick={deleteLocale} />}
                      on="click"
                      position="top center"
                    />
                  )}
                </div>
                <DiscussionEditor
                  type="RawEditor"
                  content={content.description}
                  onChangeContent={description => {
                    setModified(true);
                    setLocalizedContents(
                      update(localizedContents, {
                        [locale]: {
                          description: { $set: description }
                        }
                      })
                    );
                  }}
                  placeholder={_(".placeholder_description")}
                />
              </>
            )}
            defaultLocalizedContent={getDefaultLocalizedContent}
          />
          <Header size="medium" content={_(".header_problems")} />
          <Table className={style.problems}>
            {problems.length === 0 ? (
              <Table.Body>
                <Table.Row>
                  <Table.Cell
                    textAlign="center"
                    colSpan={100}
                    className={style.placeholder}
                    content={_(".problems_table.placeholder")}
                  />
                </Table.Row>
              </Table.Body>
            ) : (
              <>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell
                      content={_(".problems_table.alias")}
                      className={style.minWidth}
                      textAlign="center"
                    />
                    <Table.HeaderCell content={_(".problems_table.problem")} width={16} />
                    {
                      ContestTypeEditInterface.ContestTypeInjectedProblemTableColumns && <ContestTypeEditInterface.ContestTypeInjectedProblemTableColumns {...contestTypeEditProps} problem={null} />
                    }
                    <Table.HeaderCell
                      content={_(".problems_table.operations")}
                      className={style.minWidth}
                      textAlign="center"
                    />
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {problems.map(({ problem, alias }, i) => (
                    <Table.Row key={problem.id}>
                      <Table.Cell className={style.autoGrowInputColumn + " " + style.columnAlias} width={1}>
                        <div data-value={alias}>
                          <Input
                            transparent
                            fluid
                            value={alias}
                            onChange={(_, { value }) => value.length <= 20 && onChangeProblemAlias(i, value)}
                          />
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Link
                          href={getProblemUrl(problem)}
                          children={getProblemDisplayName(problem, _, "all")}
                          target="_blank"
                        />
                      </Table.Cell>
                      {
                        ContestTypeEditInterface.ContestTypeInjectedProblemTableColumns && <ContestTypeEditInterface.ContestTypeInjectedProblemTableColumns {...contestTypeEditProps} problem={{ problem, alias }} />
                      }
                      <Table.Cell className={style.minWidth + " " + style.columnOperations} textAlign="center">
                        <Button size="tiny" icon="arrow up" onClick={() => moveProblem(i, -1)} disabled={i == 0} />
                        <Button
                          size="tiny"
                          icon="arrow down"
                          onClick={() => moveProblem(i, 1)}
                          disabled={i == problems.length - 1}
                        />
                        <Popup
                          trigger={<Button size="tiny" icon="remove" negative />}
                          content={<Button negative content={_(".problems_table.confirm_delete")} onClick={() => deleteProblem(i)} />}
                          on="click"
                          position="top center"
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </>
            )}
            <Table.Footer>
              <Table.Row>
                <Table.Cell colSpan="99">
                  <div className={style.footer}>
                    <Header size="tiny">{_(".problems_table.add_problem")}</Header>
                    <ProblemSearch
                      onFilterResult={({ meta }) => problems.every(({ problem }) => problem.id !== meta.id)}
                      onResultSelect={({ meta }) => addProblem(meta)}
                    />
                    <div className={style.space} />
                    <Checkbox
                      toggle
                      checked={moveProblemWithAlias}
                      onChange={(_, { checked }) => setMoveProblemWithAlias(checked)}
                      label={_(".problems_table.move_problem_with_alias")}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            </Table.Footer>
          </Table>
          <Header size="medium" content={_(".header_options")} />
            <div className={style.checkboxes}>
              {
                (
                  [
                    "allowSeeingProblemTags",
                    "allowAccessingTestData",
                    "allowSeeingOthersSubmissions",
                    "allowSeeingOthersSubmissionDetail",
                    "showProblemStatistics",
                    "enableIssues",
                    "runPretestsOnly"
                  ] as (keyof ApiTypes.ContestOptionsDto)[]).map(key => (!(key in ContestTypeEditInterface.overriddenContestOptions)) && (
                    <Checkbox
                      key={key}
                      checked={contestOptions[key]}
                      onChange={(_, { checked }) => updateContestOptions({ key, value: checked })}
                      label={_(`.options.${key}`)}
                    />
                  ))
              }
              <ContestTypeEditInterface.ContestTypeInjectedOptionListItems {...contestTypeEditProps} type="Checkboxes" />
            </div>
            <div className={style.inputs}>
              {
                (
                  [
                    ["submissionMetaVisibility", ["Hidden", "PretestsOnly", "Visible"]],
                    ["submissionTestcaseResultVisibility", ["Hidden", "PretestsOnly", "Visible"]],
                    ["submissionTestcaseDetailVisibility", ["Hidden", "PretestsOnly", "Visible"]],
                    ["ranklistDuringContest", ["Pretests", "Real", "None"]],
                  ] as ([keyof ApiTypes.ContestOptionsDto, string[]])[]).map(([key, values]) => (!(key in ContestTypeEditInterface.overriddenContestOptions)) && (
                    <div key={key}>
                      <Header className={style.fieldHeader} content={_(`.options.${key}._`)} size="tiny" />
                      <Select
                        fluid
                        value={contestOptions[key]}
                        onChange={(_, { value }) => updateContestOptions({ key, value: value })}
                        options={values.map(v => ({
                          key: v,
                          value: v,
                          text: _(`.options.${key}.${v}`)
                        }))}
                      />
                    </div>
                  ))
              }
              {
                !("freezeRanklistForParticipantsWhen" in ContestTypeEditInterface.overriddenContestOptions) && (
                  <div>
                    <Header className={style.fieldHeader} content={_(".options.freezeRanklistForParticipantsWhen._")} size="tiny" />
                    <Input
                      fluid
                      type="number"
                      value={contestOptions.freezeRanklistForParticipantsWhen == null ? "" : Math.floor(contestOptions.freezeRanklistForParticipantsWhen / 60)}
                      onChange={e => parseNumber(e.target.value, x => (!x || x >= 0) && updateContestOptions({ key: "freezeRanklistForParticipantsWhen", value: x ? x * 60 : null }), true)}
                      labelPosition="right"
                      label={_(".options.freezeRanklistForParticipantsWhen.minutes")}
                      placeholder={_(".options.freezeRanklistForParticipantsWhen.placeholder")}
                      min="0"
                    />
                  </div>
                )
              }
              <ContestTypeEditInterface.ContestTypeInjectedOptionListItems {...contestTypeEditProps} type="Inputs" />
            </div>
        </Grid.Column>
      </Grid>
    </>
  );
};

export default {
  new: defineRoute(async request => {
    return <ContestEditPage />;
  }),
  edit: defineRoute(async request => {
    const id = Number(request.params.id);

    // API with all locales
    const { requestError, response } = await api.contest.getContestEditData({ contestId: id, locale: appState.locale });

    if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
    else if (response.error) throw new RouteError(makeToBeLocalizedText(`contest_edit.errors.${response.error}`));

    return <ContestEditPage response={response} />;
  })
};

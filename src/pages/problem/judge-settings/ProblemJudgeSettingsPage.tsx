import React, { useEffect, useState } from "react";
import { Dropdown, Grid, Header, Popup, Button, Form, Message } from "semantic-ui-react";
import { useNavigation } from "react-navi";
import { observer } from "mobx-react";
import yaml from "js-yaml";
import { v4 as uuid } from "uuid";
import lodashClonedeep from "lodash.clonedeep";

import style from "./ProblemJudgeSettingsPage.module.less";

import api from "@/api";
import { appState } from "@/appState";
import { useLocalizer, useDialog, useConfirmUnload } from "@/utils/hooks";
import toast from "@/utils/toast";
import CodeEditor from "@/components/LazyCodeEditor";
import { HighlightedCodeBox } from "@/components/CodeBox";
import { defineRoute, RouteError } from "@/AppRouter";
import { ProblemType } from "@/interfaces/ProblemType";
import { ProblemTypeEditorComponent } from "./common/interface";
import { getProblemIdString, getProblemUrl } from "../utils";
import { makeToBeLocalizedText } from "@/locales";

async function fetchData(idType: "id" | "displayId", id: number) {
  const { requestError, response } = await api.problem.getProblem({
    [idType]: id,
    judgeInfo: true,
    testData: true,
    permissionOfCurrentUser: ["Modify"]
  });

  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error)
    throw new RouteError(makeToBeLocalizedText(`problem_judge_settings.error.${response.error}`));

  return response;
}

interface ProblemJudgeSettingsPageProps {
  problem: ApiTypes.GetProblemResponseDto;
  idType?: "id" | "displayId";
  ProblemTypeEditorComponent: ProblemTypeEditorComponent;
}

let ProblemJudgeSettingsPage: React.FC<ProblemJudgeSettingsPageProps> = props => {
  const _ = useLocalizer("problem_judge_settings");
  const navigation = useNavigation();

  const idString = getProblemIdString(props.problem.meta);

  useEffect(() => {
    appState.enterNewPage(`${_(".title")} ${idString}`, "problem_set", false);
  }, [appState.locale]);

  const ProblemTypeEditorComponent = props.ProblemTypeEditorComponent;

  function parseJudgeInfo(raw: any) {
    return ProblemTypeEditorComponent.parseJudgeInfo(raw, props.problem.testData);
  }

  function normalizeJudgeInfo(judgeInfo: unknown) {
    const cloned = lodashClonedeep(judgeInfo);
    ProblemTypeEditorComponent.normalizeJudgeInfo(cloned);
    return cloned;
  }

  const [judgeInfo, setJudgeInfo] = useState(parseJudgeInfo(props.problem.judgeInfo));

  // Unmount and remount the editor after each time the judge info is edited raw by source
  const [editorUuid, setEditorUuid] = useState(uuid());

  const [pending, setPending] = useState(false);
  const [modified, setModified] = useState(false);

  function onUpdate(delta: unknown, isNotByUser?: boolean) {
    if (pending) return;
    if (!isNotByUser) setModified(true);

    setJudgeInfo(Object.assign({}, judgeInfo, delta));
  }

  function onBackToProblem() {
    navigation.navigate(getProblemUrl(props.problem.meta, { use: props.idType }));
  }

  async function onSubmit() {
    if (pending) return;

    setPending(true);

    const { requestError, response } = await api.problem.updateProblemJudgeInfo({
      problemId: props.problem.meta.id,
      judgeInfo: normalizeJudgeInfo(judgeInfo)
    });

    if (requestError) {
      toast.error(requestError(_));
    } else if (response.error) {
      if (response.error === "INVALID_JUDGE_INFO") {
        toast.error(_(`.error.INVALID_JUDGE_INFO.${response.judgeInfoError[0]}`, response.judgeInfoError));
      } else {
        toast.error(_(`.error.${response.error}`));
      }
    } else {
      toast.success(_(".submit_success"));
      setModified(false);
    }

    setPending(false);
  }

  const [editRawEditorValue, setEditRawEditorValue] = useState(yaml.safeDump(normalizeJudgeInfo(judgeInfo)));
  const [editRawEditorErrorMessage, setEditRawEditorErrorMessage] = useState("");
  const editRawDialog = useDialog(
    {},
    <Header icon="code" content={_(".edit_raw.edit_raw")} />,
    <>
      {editRawEditorErrorMessage && (
        <Message
          className={style.dialogMessage}
          error
          header={_(".edit_raw.parse_error")}
          content={
            <p>
              <code>{editRawEditorErrorMessage.trimEnd()}</code>
            </p>
          }
        />
      )}
      <CodeEditor
        className={style.codeEditor}
        value={editRawEditorValue}
        language="yaml"
        onChange={value => setEditRawEditorValue(value)}
      />
    </>,
    <>
      <Button content={_(".edit_raw.cancel")} onClick={() => editRawDialog.close()} />
      <Button
        positive
        content={_(".edit_raw.ok")}
        onClick={() => {
          try {
            const parsed = parseJudgeInfo(yaml.safeLoad(editRawEditorValue));
            setJudgeInfo(parsed);
            setEditorUuid(uuid());
            editRawDialog.close();
          } catch (e) {
            setEditRawEditorErrorMessage(e.message);
          }
        }}
      />
    </>
  );

  useConfirmUnload(() => modified);

  const [newType, setNewType] = useState(props.problem.meta.type as ProblemType);
  const [switchProblemPopupOpen, setSwitchProblemPopupOpen] = useState(false);
  async function onChangeType() {
    if (pending) return;
    setPending(true);

    if (newType === props.problem.meta.type) return;

    const { requestError, response } = await api.problem.changeProblemType({
      problemId: props.problem.meta.id,
      type: newType
    });
    setSwitchProblemPopupOpen(false);
    if (requestError) {
      toast.error(requestError(_));
    } else if (response.error) {
      toast.error(_(`.error.${response.error}`));
    } else {
      toast.success(_(".switch_type_success"));
      navigation.refresh();
    }

    setPending(false);
  }

  return (
    <>
      {editRawDialog.element}
      <Grid>
        <Grid.Row>
          <Grid.Column width={7}>
            <div className={style.leftContainer}>
              <div className={style.header}>
                <Header as="h1" content={_(".header") + " " + idString} />
                <Popup
                  trigger={
                    <Button
                      className={style.backButton}
                      disabled={pending}
                      content={_(".back_to_problem")}
                      onClick={() => !modified && onBackToProblem()}
                    />
                  }
                  // It's safe to redirect if not modified, don't confirm
                  disabled={!modified}
                  content={<Button negative content={_(".confirm_back_to_problem")} onClick={onBackToProblem} />}
                  on="click"
                  position="bottom center"
                />
                <Button
                  className={style.submitButton}
                  primary
                  loading={pending}
                  disabled={!props.problem.permissionOfCurrentUser.Modify}
                  content={props.problem.permissionOfCurrentUser.Modify ? _(".submit") : _(".no_submit_permission")}
                  onClick={onSubmit}
                />
              </div>
              <HighlightedCodeBox
                className={style.yamlCodeBox}
                segmentClassName={style.yamlSegment}
                code={yaml.safeDump(normalizeJudgeInfo(judgeInfo))}
                language="yaml"
              >
                <Button
                  className="icon labeled"
                  id={style.buttonEditRaw}
                  icon="code"
                  content={_(".edit_raw.edit_raw")}
                  onClick={() => {
                    setEditRawEditorErrorMessage("");
                    setEditRawEditorValue(yaml.safeDump(normalizeJudgeInfo(judgeInfo)));
                    editRawDialog.open();
                  }}
                />
              </HighlightedCodeBox>
            </div>
          </Grid.Column>
          <Grid.Column width={9}>
            <Form className={style.problemTypeForm}>
              <Form.Field inline className={style.field}>
                <label className={style.label}>{_(".problem_type")}</label>
                <Dropdown
                  className={style.dropdown}
                  selection
                  value={newType}
                  options={Object.values(ProblemType).map(type => ({
                    key: type,
                    value: type,
                    text: _(`problem.type.${type}`)
                  }))}
                  onChange={(e, { value }) => setNewType(value as ProblemType)}
                />
                <Popup
                  trigger={
                    <Button
                      disabled={pending || newType === props.problem.meta.type}
                      className={style.switchButton}
                      content={_(".switch_type")}
                    />
                  }
                  content={<Button negative content={_(".confirm_switch_type")} onClick={onChangeType} />}
                  open={switchProblemPopupOpen}
                  onOpen={() => setSwitchProblemPopupOpen(true)}
                  onClose={() => setSwitchProblemPopupOpen(false)}
                  position="top center"
                  on="click"
                />
              </Form.Field>
            </Form>
            <ProblemTypeEditorComponent
              key={editorUuid}
              pending={pending}
              judgeInfo={judgeInfo}
              testData={props.problem.testData}
              onUpdateJudgeInfo={onUpdate}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </>
  );
};

ProblemJudgeSettingsPage = observer(ProblemJudgeSettingsPage);

async function getProblemTypeEditorComponent(type: ProblemType): Promise<ProblemTypeEditorComponent> {
  return (
    await (() => {
      switch (type) {
        case ProblemType.Traditional:
          return import("./types/TraditionalProblemEditor");
        case ProblemType.Interaction:
          return import("./types/InteractionProblemEditor");
        case ProblemType.SubmitAnswer:
          return import("./types/SubmitAnswerProblemEditor");
      }
    })()
  ).default;
}

export default {
  byId: defineRoute(async request => {
    const id = parseInt(request.params["id"]);
    const problem = await fetchData("id", id);

    return (
      <ProblemJudgeSettingsPage
        key={Math.random()}
        idType="id"
        problem={problem}
        ProblemTypeEditorComponent={await getProblemTypeEditorComponent(problem.meta.type as ProblemType)}
      />
    );
  }),
  byDisplayId: defineRoute(async request => {
    const displayId = parseInt(request.params["displayId"]);
    const problem = await fetchData("displayId", displayId);

    return (
      <ProblemJudgeSettingsPage
        key={Math.random()}
        idType="displayId"
        problem={problem}
        ProblemTypeEditorComponent={await getProblemTypeEditorComponent(problem.meta.type as ProblemType)}
      />
    );
  })
};

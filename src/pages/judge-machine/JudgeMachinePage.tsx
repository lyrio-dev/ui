import React, { useEffect, useState } from "react";
import { Table, Header, Button, Segment, Label, Popup, Icon, Form } from "semantic-ui-react";
import { route } from "navi";
import { useNavigation } from "react-navi";
import { observer } from "mobx-react";

import style from "./JudgeMachinePage.module.less";

import { useIntlMessage } from "@/utils/hooks";
import { JudgeClientApi } from "@/api";
import toast from "@/utils/toast";
import { appState } from "@/appState";

interface JudgeClientSystemInfo {
  os: string;
  kernel: string;
  arch: string;
  cpu: {
    model: string;
    flags: string;
    cache: Record<string, number>;
  };
  memory: {
    size: number;
    description: string;
  };
  languages: {};
  extraInfo: string;
}

async function fetchData(): Promise<JudgeMachinePageProps> {
  const { requestError, response } = await JudgeClientApi.listJudgeClients();
  if (requestError) toast.error(requestError);
  else return response;
}

interface JudgeMachinePageProps {
  hasManagePermission: boolean;
  judgeClients: ApiTypes.JudgeClientInfoDto[];
}

let JudgeMachinePage: React.FC<JudgeMachinePageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(_("judge_machine.title"), false);
  }, [appState.locale]);

  function getCpu(judgeClient: ApiTypes.JudgeClientInfoDto) {
    if (judgeClient.systemInfo && judgeClient.systemInfo) {
      const systemInfo = judgeClient.systemInfo as JudgeClientSystemInfo;
      const hasFlags = !!systemInfo.cpu.flags;
      const hasCache =
        systemInfo.cpu.cache &&
        typeof systemInfo.cpu.cache === "object" &&
        Object.keys(systemInfo.cpu.cache).length !== 0;
      return (
        <Popup
          trigger={<span>{systemInfo.cpu.model}</span>}
          disabled={!hasFlags && !hasCache}
          content={
            <>
              {hasFlags && (
                <>
                  <Header content="Flags" />
                  <p className={style.cpuFlags}>
                    <code>{systemInfo.cpu.flags}</code>
                  </p>
                </>
              )}
              {hasCache && (
                <>
                  <Header content="Cache" />
                  <table className={style.cpuCache}>
                    <tbody>
                      {Object.entries(systemInfo.cpu.cache).map(([name, value]) => (
                        <tr key={name}>
                          <td align="left" className={style.cpuCacheName}>
                            <strong>{name}</strong>
                          </td>
                          <td>{Math.round(value / 1024) + " KiB"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </>
          }
          hoverable
        />
      );
    }
    return "-";
  }

  function getMemory(judgeClient: ApiTypes.JudgeClientInfoDto) {
    if (judgeClient.systemInfo && judgeClient.systemInfo) {
      const systemInfo = judgeClient.systemInfo as JudgeClientSystemInfo;
      return systemInfo.memory.description + " (" + Math.round(systemInfo.memory.size / 1024) + " MiB)";
    }
    return "-";
  }

  function getKernel(judgeClient: ApiTypes.JudgeClientInfoDto) {
    if (judgeClient.systemInfo && judgeClient.systemInfo) {
      const systemInfo = judgeClient.systemInfo as JudgeClientSystemInfo;
      return systemInfo.kernel;
    }
    return "-";
  }

  const [resetPopupOpened, setResetPopupOpened] = useState<number>(null);
  async function onResetKey(id: number) {
    const { requestError, response } = await JudgeClientApi.resetJudgeClientKey({
      id
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`judge_machine.error.${response.error}`));
    else {
      toast.success(_("judge_machine.reset_key_success"));
      navigation.refresh();
      setResetPopupOpened(null);
    }
  }

  const [deletePopupOpened, setDeletePopupOpened] = useState<number>(null);
  async function onDelete(id: number) {
    const { requestError, response } = await JudgeClientApi.deleteJudgeClient({
      id
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`judge_machine.error.${response.error}`));
    else {
      toast.success(_("judge_machine.delete_success"));
      navigation.refresh();
      setDeletePopupOpened(null);
    }
  }

  const [addPopupOpened, setAddPopupOpened] = useState(false);
  const [addPending, setAddPending] = useState(false);
  const [addNewName, setAddNewName] = useState("");
  const addNewNameValid = addNewName.length >= 1 && addNewName.length <= 80;
  async function onAddJudgeClient() {
    if (addPending) return;
    setAddPending(true);

    const { requestError, response } = await JudgeClientApi.addJudgeClient({
      name: addNewName,
      allowedHosts: []
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`judge_machine.error.${response.error}`));
    else {
      toast.success(_("judge_machine.add_success"));
      navigation.refresh();
    }

    setAddPending(false);
    setAddPopupOpened(false);
    setAddNewName("");
  }

  return (
    <>
      <div className={style.headerWrapper}>
        <Header as="h1" className={style.header} content={_("judge_machine.header")} />
        <Button
          icon="refresh"
          content={_("judge_machine.refresh")}
          labelPosition="left"
          onClick={() => navigation.refresh()}
        />
        {props.hasManagePermission && (
          <Popup
            open={addPopupOpened || addPending}
            onOpen={() => setAddPopupOpened(true)}
            onClose={() => setAddPopupOpened(false)}
            content={
              <Form>
                <Form.Input
                  style={{ width: 230 }}
                  placeholder={_("judge_machine.add_new_name")}
                  value={addNewName}
                  onChange={(e, { value }) => setAddNewName(value)}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.keyCode === 13 && addNewNameValid) {
                      e.preventDefault();
                      onAddJudgeClient();
                    }
                  }}
                />
                <Button loading={addPending} disabled={!addNewNameValid} onClick={onAddJudgeClient}>
                  {_("judge_machine.confirm_add")}
                </Button>
              </Form>
            }
            trigger={
              <Button
                className={style.addButton}
                icon="plus"
                content={_("judge_machine.add")}
                labelPosition="left"
                primary
              />
            }
            on="click"
            position="bottom right"
          />
        )}
      </div>
      {!props.judgeClients.length ? (
        <Segment placeholder>
          <Header icon>
            <Icon name="server" />
            {_("judge_machine.no_judge_machine")}
          </Header>
        </Segment>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell className={style.columnStatus}>{_("judge_machine.status")}</Table.HeaderCell>
              <Table.HeaderCell>{_("judge_machine.name")}</Table.HeaderCell>
              <Table.HeaderCell>{_("judge_machine.cpu")}</Table.HeaderCell>
              <Table.HeaderCell>{_("judge_machine.memory")}</Table.HeaderCell>
              <Table.HeaderCell>{_("judge_machine.kernel")}</Table.HeaderCell>
              {props.hasManagePermission && (
                <Table.HeaderCell textAlign="center" className={style.columnOperations}>
                  {_("judge_machine.operations")}
                </Table.HeaderCell>
              )}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {props.judgeClients.map(judgeClient => (
              <Table.Row key={judgeClient.id}>
                <Table.Cell className={style.columnStatus}>
                  <Label className={style.onlineStatus} circular color={judgeClient.online ? "green" : "red"} empty />
                  {judgeClient.online ? _("judge_machine.online") : _("judge_machine.offline")}
                </Table.Cell>
                <Table.Cell>{judgeClient.name}</Table.Cell>
                <Table.Cell>{getCpu(judgeClient)}</Table.Cell>
                <Table.Cell>{getMemory(judgeClient)}</Table.Cell>
                <Table.Cell>{getKernel(judgeClient)}</Table.Cell>
                {props.hasManagePermission && (
                  <Table.Cell textAlign="center" className={style.columnOperations}>
                    <Popup
                      trigger={<Icon name="key" title={_("judge_machine.key")} />}
                      content={<code>{judgeClient.key}</code>}
                      on="click"
                      position="bottom center"
                    />
                    <Popup
                      open={resetPopupOpened === judgeClient.id}
                      onOpen={() => setResetPopupOpened(judgeClient.id)}
                      onClose={() => setResetPopupOpened(null)}
                      trigger={<Icon name="refresh" title={_("judge_machine.reset_key")} />}
                      content={
                        <Button
                          negative
                          content={_("judge_machine.confirm_reset_key")}
                          onClick={() => onResetKey(judgeClient.id)}
                        />
                      }
                      on="click"
                      position="bottom center"
                    />
                    <Popup
                      open={deletePopupOpened === judgeClient.id}
                      onOpen={() => setDeletePopupOpened(judgeClient.id)}
                      onClose={() => setDeletePopupOpened(null)}
                      trigger={<Icon name="delete" title={_("judge_machine.delete")} />}
                      content={
                        <Button
                          negative
                          content={_("judge_machine.confirm_delete")}
                          onClick={() => onDelete(judgeClient.id)}
                        />
                      }
                      on="click"
                      position="bottom center"
                    />
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </>
  );
};

JudgeMachinePage = observer(JudgeMachinePage);

export default route({
  async getView(request) {
    const props = await fetchData();
    if (!props) {
      // TODO: Display an error page
      return null;
    }

    return <JudgeMachinePage {...props} />;
  }
});

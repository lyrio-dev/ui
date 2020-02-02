import React, { useState } from "react";
import { Table, Button, Popup, Header, Image, Icon, Dropdown } from "semantic-ui-react";
import { observer } from "mobx-react";
import update from "immutability-helper";

import style from "./PermissionManager.module.less";

import { useIntlMessage, useConfirmUnload, useDialog } from "@/utils/hooks";
import getUserAvatar from "@/utils/getUserAvatar";
import { UserMeta } from "@/interfaces/UserMeta";
import { GroupMeta } from "@/interfaces/GroupMeta";
import { UserApi, GroupApi } from "@/api";
import toast from "@/utils/toast";
import TableCellSearchDropdown from "./TableCellSearchDropdown";

type PermissionLevelDetails = Record<number, { title: string /* description: string; */ }>;

interface UserPermissionDtoForRequest {
  userId: number;
  permissionLevel: number;
}

interface GroupPermissionDtoForRequest {
  groupId: number;
  permissionLevel: number;
}

interface UserPermissionDtoForResponse {
  user: UserMeta;
  permissionLevel: number;
}

interface GroupPermissionDtoForResponse {
  group: GroupMeta;
  permissionLevel: number;
}

interface PermissionsForResponse {
  owner: UserMeta;
  userPermissions: UserPermissionDtoForResponse[];
  groupPermissions: GroupPermissionDtoForResponse[];
}

export interface PermissionManagerProps {
  haveSubmitPermission: boolean;
  objectDescription: string; // e.g. "Problem #1"
  permissionsLevelDetails: PermissionLevelDetails;
  refOpen: React.MutableRefObject<() => Promise<boolean>>;
  onGetInitialPermissions: () => Promise<PermissionsForResponse>;
  onSubmitPermissions: (
    userPermissions: UserPermissionDtoForRequest[],
    groupPermissions: GroupPermissionDtoForRequest[]
  ) => Promise<
    | {
        error?: "PERMISSION_DENIED" | "NO_SUCH_USER" | "NO_SUCH_GROUP" | string;
        errorObjectId?: number;
      }
    | true
  >;
}

let PermissionManager: React.FC<PermissionManagerProps> = props => {
  const _ = useIntlMessage();

  const defaultPermissionLevel = Number(Object.keys(props.permissionsLevelDetails)[0]);

  const [modified, setModified] = useState(false);
  useConfirmUnload(() => modified);

  const [opened, setOpened] = useState(false);

  const [permissions, setPermissions] = useState<PermissionsForResponse>(null);

  async function onSearchUser(input: string) {
    const { requestError, response } = await UserApi.searchUser({
      query: input,
      wildcard: "END"
    });

    if (requestError) toast.error(requestError);
    else
      return response.userMetas.map(user => ({
        key: user.id,
        data: user,
        content: (
          <>
            <Image className={style.userResult + " " + style.avatar} src={getUserAvatar(user)} rounded size="tiny" />
            <div className={style.userResult + " " + style.username}>{user.username}</div>
            <div>{user.email}</div>
          </>
        )
      }));

    return [];
  }

  function addUser(user: UserMeta) {
    if (permissions.owner.id === user.id) return;
    for (const userPermission of permissions.userPermissions) {
      if (userPermission.user.id === user.id) return;
    }

    setModified(true);
    setPermissions(
      update(permissions, {
        userPermissions: {
          $push: [
            {
              user,
              permissionLevel: defaultPermissionLevel
            }
          ]
        }
      })
    );
  }

  function changeUserPermission(index: number, permissionLevel: number) {
    setModified(true);
    setPermissions(
      update(permissions, {
        userPermissions: {
          [index]: {
            permissionLevel: {
              $set: permissionLevel
            }
          }
        }
      })
    );
  }

  function deleteUser(index: number) {
    setModified(true);
    setPermissions(
      update(permissions, {
        userPermissions: {
          $splice: [[index, 1]]
        }
      })
    );
  }

  async function onSearchGroup(input: string) {
    const { requestError, response } = await GroupApi.searchGroup({
      query: input,
      wildcard: "END"
    });

    if (requestError) toast.error(requestError);
    else
      return response.groupMetas.map(group => ({
        key: group.id,
        data: group,
        content: (
          <span className={style.groupName}>
            <Icon className={style.groupIcon} name="group" />
            {group.name}
          </span>
        )
      }));

    return [];
  }

  function addGroup(group: GroupMeta) {
    for (const groupPermission of permissions.groupPermissions) {
      if (groupPermission.group.id === group.id) return;
    }

    setModified(true);
    setPermissions(
      update(permissions, {
        groupPermissions: {
          $push: [
            {
              group,
              permissionLevel: defaultPermissionLevel
            }
          ]
        }
      })
    );
  }

  function changeGroupPermission(index: number, permissionLevel: number) {
    setModified(true);
    setPermissions(
      update(permissions, {
        groupPermissions: {
          [index]: {
            permissionLevel: {
              $set: permissionLevel
            }
          }
        }
      })
    );
  }

  function deleteGroup(index: number) {
    setModified(true);
    setPermissions(
      update(permissions, {
        groupPermissions: {
          $splice: [[index, 1]]
        }
      })
    );
  }

  function onClose() {
    setModified(false);
    setOpened(false);
    dialog.close();
  }

  const [pendingSubmit, setPendingSubmit] = useState(false);
  async function onSubmit() {
    if (pendingSubmit) return;
    setPendingSubmit(true);

    const response = await props.onSubmitPermissions(
      permissions.userPermissions.map(({ user, permissionLevel }) => ({
        userId: user.id,
        permissionLevel
      })),
      permissions.groupPermissions.map(({ group, permissionLevel }) => ({
        groupId: group.id,
        permissionLevel
      }))
    );

    if (response === true) {
      onClose();
    } else if (response.error) {
      toast.error(
        _(
          `components.permission_manager.submit_error.${response.error}`,
          !response.errorObjectId
            ? null
            : {
                id: response.errorObjectId.toString()
              }
        )
      );
    }

    setPendingSubmit(false);
  }

  const dialog = useDialog(
    {},
    () => (
      <Header
        icon="key"
        className={style.dialogHeader}
        content={
          <>
            {_("components.permission_manager.header")}
            <div className={style.dialogHeaderInfo}>{props.objectDescription}</div>
          </>
        }
      />
    ),
    () => (
      <>
        <Header as="h4">{_("components.permission_manager.permission_for_users")}</Header>
        <Table>
          <Table.Body>
            <Table.Row>
              <Table.Cell width={4}>
                <Header as="h4" image>
                  <Image className={style.avatar} src={getUserAvatar(permissions.owner)} rounded size="mini" />
                  <Header.Content>
                    {permissions.owner.username}
                    {/* <Header.Subheader>{permissions.owner.name}</Header.Subheader> */}
                  </Header.Content>
                </Header>
              </Table.Cell>
              <Table.Cell width={6}>{permissions.owner.email}</Table.Cell>
              <Table.Cell width={4}>{_("components.permission_manager.owner")}</Table.Cell>
              <Table.Cell width={2} textAlign="right">
                <Icon disabled name="delete" />
              </Table.Cell>
            </Table.Row>
            {permissions.userPermissions.map((userPermission, index) => (
              <Table.Row key={userPermission.user.id}>
                <Table.Cell>
                  <Header as="h4" image>
                    <Image className={style.avatar} src={getUserAvatar(userPermission.user)} rounded size="mini" />
                    <Header.Content>
                      {userPermission.user.username}
                      {/* <Header.Subheader>{userPermission.user.name}</Header.Subheader> */}
                    </Header.Content>
                  </Header>
                </Table.Cell>
                <Table.Cell>{userPermission.user.email}</Table.Cell>
                <Table.Cell>
                  <Dropdown
                    value={userPermission.permissionLevel.toString()}
                    options={Object.keys(props.permissionsLevelDetails).map(permissionLevel => ({
                      key: permissionLevel,
                      value: permissionLevel,
                      text: props.permissionsLevelDetails[(permissionLevel as any) as number].title,
                      disabled:
                        !props.haveSubmitPermission && Number(permissionLevel) !== userPermission.permissionLevel
                    }))}
                    onChange={(e, { value }) => changeUserPermission(index, value as number)}
                  />
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Icon name="delete" disabled={!props.haveSubmitPermission} onClick={() => deleteUser(index)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          {props.haveSubmitPermission && (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan={4}>
                  <TableCellSearchDropdown
                    placeholder={_("components.permission_manager.search_users")}
                    onSearch={onSearchUser}
                    onSelect={user => addUser(user)}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
        <Header as="h4">{_("components.permission_manager.permission_for_groups")}</Header>
        <Table compact>
          <Table.Body>
            {permissions.groupPermissions.length === 0 ? (
              <Table.Row>
                <Table.HeaderCell colSpan={3} textAlign="center" className={style.noGroupGranted}>
                  {_("components.permission_manager.no_group_granted")}
                </Table.HeaderCell>
              </Table.Row>
            ) : (
              permissions.groupPermissions.map((groupPermission, index) => (
                <Table.Row key={groupPermission.group.id}>
                  <Table.Cell className={style.groupName} width={7}>
                    <Icon className={style.groupIcon} name="group" />
                    {groupPermission.group.name}
                  </Table.Cell>
                  <Table.Cell width={4}>
                    <Dropdown
                      value={groupPermission.permissionLevel.toString()}
                      options={Object.keys(props.permissionsLevelDetails).map(permissionLevel => ({
                        key: permissionLevel,
                        value: permissionLevel,
                        text: props.permissionsLevelDetails[(permissionLevel as any) as number].title,
                        disabled:
                          !props.haveSubmitPermission && Number(permissionLevel) !== groupPermission.permissionLevel
                      }))}
                      onChange={(e, { value }) => changeGroupPermission(index, value as number)}
                    />
                  </Table.Cell>
                  <Table.Cell width={5} textAlign="right">
                    <Icon name="delete" disabled={!props.haveSubmitPermission} onClick={() => deleteGroup(index)} />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
          {props.haveSubmitPermission && (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan={3}>
                  <TableCellSearchDropdown
                    placeholder={_("components.permission_manager.search_groups")}
                    onSearch={onSearchGroup}
                    onSelect={group => addGroup(group)}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
      </>
    ),
    () => (
      <>
        <Popup
          trigger={
            <Button
              content={_("components.permission_manager.cancel")}
              disabled={pendingSubmit}
              onClick={() => !modified && onClose()}
            />
          }
          // It's safe to close if not modified, don't confirm
          disabled={!modified}
          content={
            <Button negative content={_("components.permission_manager.confirm_cancel")} onClick={() => onClose()} />
          }
          on="click"
          position="top center"
        />
        <Button
          positive
          content={
            props.haveSubmitPermission
              ? _("components.permission_manager.submit")
              : _("components.permission_manager.no_submit_permission")
          }
          loading={pendingSubmit}
          disabled={!props.haveSubmitPermission}
          onClick={() => onSubmit()}
        />
      </>
    )
  );

  const [pendingOpen, setPendingOpen] = useState(false);
  props.refOpen.current = async () => {
    if (opened || pendingOpen) return;

    setPendingOpen(true);
    const initialPermissions = await props.onGetInitialPermissions();
    setPendingOpen(false);

    if (!initialPermissions) return false;

    setOpened(true);
    setPermissions(initialPermissions);

    dialog.open();
    return true;
  };

  return dialog.element;
};

PermissionManager = observer(PermissionManager);

export default PermissionManager;

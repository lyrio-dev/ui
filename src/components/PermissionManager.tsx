import React, { useEffect, useState } from "react";
import { Table, Button, Popup, Header, Icon, Dropdown } from "semantic-ui-react";
import { observer } from "mobx-react";
import update from "immutability-helper";

import style from "./PermissionManager.module.less";

import {
  useLocalizer,
  useConfirmNavigation,
  useDialog,
  useAsyncCallbackPending,
  useScreenWidthWithin
} from "@/utils/hooks";
import { UserMeta } from "@/interfaces/UserMeta";
import { GroupMeta } from "@/interfaces/GroupMeta";
import api from "@/api";
import toast from "@/utils/toast";
import TableCellSearchDropdown from "./TableCellSearchDropdown";
import UserAvatar from "./UserAvatar";

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
  haveSubmitPermission: boolean;
}

export interface PermissionManagerProps {
  objectDescription: string; // e.g. "Problem #1"
  permissionsLevelDetails: PermissionLevelDetails;
  refOpen: React.Ref<() => Promise<boolean>>;
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
  const _ = useLocalizer("components.permission_manager");

  const defaultPermissionLevel = Number(Object.keys(props.permissionsLevelDetails)[0]);

  const [modified, setModified] = useConfirmNavigation();

  const [opened, setOpened] = useState(false);

  const [permissions, setPermissions] = useState<PermissionsForResponse>(null);

  const isMobile = useScreenWidthWithin(0, 768);

  async function onSearchUser(input: string) {
    const { requestError, response } = await api.user.searchUser({
      query: input,
      wildcard: "End"
    });

    if (requestError) toast.error(requestError(_));
    else
      return response.userMetas.map(user => ({
        key: user.id,
        data: user,
        content: isMobile ? (
          <div className={style.userResultContainer}>
            <Header as="h4" image className={style.userResult + " " + style.firstRow}>
              <UserAvatar
                className={style.userResult + " " + style.avatar}
                userAvatar={user.avatar}
                imageSize={27.5}
                rounded
              />
              <div className={style.userResult + " " + style.username}>{user.username}</div>
            </Header>
            {user.email && <div className={style.userResult + " " + style.email}>{user.email}</div>}
          </div>
        ) : (
          <>
            <UserAvatar
              className={style.userResult + " " + style.avatar}
              userAvatar={user.avatar}
              imageSize={27.5}
              rounded
            />
            <div className={style.userResult + " " + style.username}>{user.username}</div>
            {user.email && <div>{user.email}</div>}
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
    const { requestError, response } = await api.group.searchGroup({
      query: input,
      wildcard: "End"
    });

    if (requestError) toast.error(requestError(_));
    else
      return response.groupMetas.map(group => ({
        key: group.id,
        data: group,
        content: (
          <div className={style.groupName}>
            <Icon className={style.groupIcon} name="group" />
            {group.name}
          </div>
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

  const [pendingSubmit, onSubmit] = useAsyncCallbackPending(async () => {
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
          `.submit_error.${response.error}`,
          !response.errorObjectId
            ? null
            : {
                id: response.errorObjectId.toString()
              }
        )
      );
    }
  });

  const getUsernameAndEmailColumns = (user: UserMeta) => (
    <>
      <Table.Cell width={isMobile ? 8 : 4} className={style.columnUsername}>
        <Header as="h4" image>
          <UserAvatar className={style.avatar} userAvatar={user.avatar} imageSize={27.5} rounded />
          <Header.Content>
            {user.username}
            {/* <Header.Subheader>{user.name}</Header.Subheader> */}
          </Header.Content>
        </Header>
        {isMobile && user.email && <div className={style.emailInMobileView}>{user.email}</div>}
      </Table.Cell>
      {!isMobile && <Table.Cell width={6}>{user.email}</Table.Cell>}
    </>
  );

  const dialog = useDialog(
    {},
    () => (
      <Header
        icon="key"
        className={style.dialogHeader}
        content={
          <>
            {_(".header")}
            {!isMobile && <div className={style.dialogHeaderInfo}>{props.objectDescription}</div>}
          </>
        }
      />
    ),
    () => (
      <>
        <Header as="h4">{_(".permission_for_users")}</Header>
        <Table fixed unstackable>
          <Table.Body>
            <Table.Row>
              {getUsernameAndEmailColumns(permissions.owner)}
              <Table.Cell width={isMobile ? 6 : 4}>{_(".owner")}</Table.Cell>
              <Table.Cell width={2} textAlign="right">
                <Icon disabled name="delete" />
              </Table.Cell>
            </Table.Row>
            {permissions.userPermissions.map((userPermission, index) => (
              <Table.Row key={userPermission.user.id}>
                {getUsernameAndEmailColumns(userPermission.user)}
                <Table.Cell className={style.columnDropdown}>
                  <Dropdown
                    value={userPermission.permissionLevel.toString()}
                    options={Object.keys(props.permissionsLevelDetails).map(permissionLevel => ({
                      key: permissionLevel,
                      value: permissionLevel,
                      text: props.permissionsLevelDetails[permissionLevel as any as number].title,
                      disabled:
                        !permissions.haveSubmitPermission && Number(permissionLevel) !== userPermission.permissionLevel
                    }))}
                    onChange={(e, { value }) => changeUserPermission(index, Number(value))}
                  />
                </Table.Cell>
                <Table.Cell textAlign="right">
                  <Icon name="delete" disabled={!permissions.haveSubmitPermission} onClick={() => deleteUser(index)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
          {permissions.haveSubmitPermission && (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan={4} className={style.columnDropdown}>
                  <TableCellSearchDropdown
                    placeholder={_(".search_users")}
                    noResultMessage={_(".search_users_no_result")}
                    onSearch={onSearchUser}
                    onSelect={user => addUser(user)}
                  />
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          )}
        </Table>
        <Header as="h4">{_(".permission_for_groups")}</Header>
        <Table compact fixed unstackable>
          <Table.Body>
            {permissions.groupPermissions.length === 0 ? (
              <Table.Row>
                <Table.HeaderCell colSpan={3} textAlign="center" className={style.noGroupGranted}>
                  {_(".no_group_granted")}
                </Table.HeaderCell>
              </Table.Row>
            ) : (
              permissions.groupPermissions.map((groupPermission, index) => (
                <Table.Row key={groupPermission.group.id}>
                  <Table.Cell className={style.columnGroupName} width={7}>
                    <Icon className={style.groupIcon} name="group" />
                    {groupPermission.group.name}
                  </Table.Cell>
                  <Table.Cell width={4} className={style.columnDropdown}>
                    <Dropdown
                      value={groupPermission.permissionLevel.toString()}
                      options={Object.keys(props.permissionsLevelDetails).map(permissionLevel => ({
                        key: permissionLevel,
                        value: permissionLevel,
                        text: props.permissionsLevelDetails[permissionLevel as any as number].title,
                        disabled:
                          !permissions.haveSubmitPermission &&
                          Number(permissionLevel) !== groupPermission.permissionLevel
                      }))}
                      onChange={(e, { value }) => changeGroupPermission(index, Number(value))}
                    />
                  </Table.Cell>
                  <Table.Cell width={5} textAlign="right">
                    <Icon
                      name="delete"
                      disabled={!permissions.haveSubmitPermission}
                      onClick={() => deleteGroup(index)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
          {permissions.haveSubmitPermission && (
            <Table.Footer>
              <Table.Row>
                <Table.HeaderCell colSpan={3} className={style.columnDropdown}>
                  <TableCellSearchDropdown
                    placeholder={_(".search_groups")}
                    noResultMessage={_(".search_groups_no_result")}
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
          trigger={<Button content={_(".cancel")} disabled={pendingSubmit} onClick={() => !modified && onClose()} />}
          // It's safe to close if not modified, don't confirm
          disabled={!modified}
          content={<Button negative content={_(".confirm_cancel")} onClick={() => onClose()} />}
          on="click"
          position="top center"
        />
        <Button
          positive
          content={permissions.haveSubmitPermission ? _(".submit") : _(".no_submit_permission")}
          loading={pendingSubmit}
          disabled={!permissions.haveSubmitPermission}
          onClick={() => onSubmit()}
        />
      </>
    )
  );

  const [pendingOpen, setPendingOpen] = useState(false);
  useEffect(() => {
    const open = async () => {
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

    if (typeof props.refOpen === "function") props.refOpen(open);
    else (props.refOpen as React.MutableRefObject<() => Promise<boolean>>).current = open;
  }, [props.refOpen, props.onGetInitialPermissions, opened, pendingOpen, dialog]);

  return dialog.element;
};

PermissionManager = observer(PermissionManager);

export default PermissionManager;

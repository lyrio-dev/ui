import React, { useEffect, useState } from "react";
import {
  Grid,
  Header,
  Button,
  List,
  Icon,
  Segment,
  Popup,
  Divider,
  Table,
  Accordion,
  Input,
  Form,
  Checkbox
} from "semantic-ui-react";
import { observer } from "mobx-react";
import { Link } from "react-navi";

import style from "./GroupsPage.module.less";

import { appState } from "@/appState";
import api from "@/api";
import { useAsyncCallbackPending, useLocalizer } from "@/utils/hooks";
import { defineRoute, RouteError } from "@/AppRouter";
import toast from "@/utils/toast";
import UserLink from "@/components/UserLink";
import UserAvatar from "@/components/UserAvatar";
import UserSearch from "@/components/UserSearch";
import { onEnterPress } from "@/utils/onEnterPress";
import { makeToBeLocalizedText } from "@/locales";

async function fetchData(): Promise<ApiTypes.GetGroupListResponseDto> {
  if (!appState.currentUser) throw new RouteError(makeToBeLocalizedText("groups.not_logged_in"));
  const { requestError, response } = await api.group.getGroupList();
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  return response;
}

interface GroupItemProps {
  meta: ApiTypes.GroupMetaDto;
  hasPermission: boolean;
  onDelete: () => void;
}

let GroupItem: React.FC<GroupItemProps> = props => {
  const _ = useLocalizer("groups");

  const [memberListLoading, setMemberListLoading] = useState(false);
  const [memberList, setMemberList] = useState<ApiTypes.GetGroupMemberListResponseItem[]>(null);
  const [memberListOpened, setMemberListOpened] = useState(false);

  async function onToggleMemberList() {
    if (memberListLoading || pending) return;

    // If already opened, close it
    if (memberListOpened) {
      setMemberListOpened(false);
      return;
    }
    // Else load it

    setMemberListLoading(true);

    const { requestError, response } = await api.group.getGroupMemberList({
      groupId: props.meta.id
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setMemberList(response.memberList);
      setMemberListOpened(true);
    }

    setMemberListLoading(false);
  }

  const hasPrivilege = appState.currentUserHasPrivilege("ManageUserGroup");

  const [pending, setPending] = useState(false);
  async function onSetGroupAdmin(userId: number, isGroupAdmin: boolean) {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await api.group.setGroupAdmin({
      groupId: props.meta.id,
      userId,
      isGroupAdmin
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setMemberList(
        memberList.map(member =>
          member.userMeta.id === userId
            ? Object.assign({}, member, {
                isGroupAdmin
              })
            : member
        )
      );
    }

    setPending(false);
  }

  const [name, setName] = useState(props.meta.name);
  const [renamePopupOpen, setRenamePopupOpen] = useState(false);
  const [renameInputValue, setRenameInputValue] = useState(name);

  async function onRename() {
    if (renameInputValue === name) {
      setRenamePopupOpen(false);
      return;
    }

    if (pending) return;
    setPending(true);

    const { requestError, response } = await api.group.renameGroup({
      groupId: props.meta.id,
      name: renameInputValue
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setName(renameInputValue);
      setRenamePopupOpen(false);
    }

    setPending(false);
  }

  async function onAddUser(userMeta: ApiTypes.UserMetaDto) {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await api.group.addMember({
      groupId: props.meta.id,
      userId: userMeta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setMemberList([
        ...memberList,
        {
          userMeta,
          isGroupAdmin: false
        }
      ]);
    }

    setPending(false);
  }

  async function onDelete() {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await api.group.deleteGroup({
      groupId: props.meta.id
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      props.onDelete();
    }

    setPending(false);
  }

  async function onRemoveUser(userId: number) {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await api.group.removeMember({
      groupId: props.meta.id,
      userId: userId
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setMemberList(memberList.filter(member => member.userMeta.id !== userId));
    }

    setPending(false);
  }

  return (
    <>
      <Accordion.Title className={style.groupItem} onClick={onToggleMemberList} active={memberListOpened}>
        <Grid>
          <Grid.Column width={5}>
            <Icon name="users" />
            &nbsp;{name}
          </Grid.Column>
          <Grid.Column width={8}>
            {!hasPrivilege && (
              <Checkbox toggle label={_(".group_admin")} readOnly checked={props.hasPermission || hasPrivilege} />
            )}
          </Grid.Column>
          <Grid.Column width={3} className={style.memberCount}>
            <Icon name="user" />
            &nbsp;×&nbsp;&nbsp;{memberList ? memberList.length : props.meta.memberCount}
            {memberListLoading ? <Icon name="spinner" loading /> : <Icon name="dropdown" />}
          </Grid.Column>
        </Grid>
      </Accordion.Title>
      <Accordion.Content active={memberListOpened}>
        {memberList && (
          <Segment className={style.memberListSegment}>
            <div className={style.memberListHeader}>
              {(hasPrivilege || props.hasPermission) && (
                <UserSearch
                  className={style.memberListUserSearch}
                  placeholder={_(".search_to_add_user")}
                  onResultSelect={onAddUser}
                />
              )}
              {hasPrivilege && (
                <>
                  <Popup
                    trigger={<Button className={style.renameGroup} content={_(".rename_group")} />}
                    content={
                      <Form>
                        <Form.Input
                          style={{ width: 230 }}
                          placeholder={_(".rename_group_new_name")}
                          value={renameInputValue}
                          autoComplete="username"
                          readOnly={pending}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRenameInputValue(e.target.value)}
                          onKeyPress={onEnterPress(() => onRename())}
                        />
                        <Button primary disabled={pending} onClick={onRename}>
                          {_(".confirm_rename_group")}
                        </Button>
                      </Form>
                    }
                    open={renamePopupOpen}
                    onOpen={() => setRenamePopupOpen(true)}
                    onClose={() => setRenamePopupOpen(false)}
                    on="click"
                    position="top right"
                  />
                  <Popup
                    trigger={<Button className={style.deleteGroup} negative content={_(".delete_group")} />}
                    content={
                      <Button negative disabled={pending} onClick={onDelete}>
                        {_(".confirm_delete_group")}
                      </Button>
                    }
                    on="click"
                    position="top center"
                  />
                </>
              )}
            </div>
            <Table basic="very" compact structured className={style.memberList}>
              {memberList.length > 0 && (
                <Table.Body>
                  {memberList.map(({ userMeta, isGroupAdmin }) => (
                    <Table.Row key={userMeta.id}>
                      <Table.Cell width={5}>
                        <div className={style.usernameCellContainer}>
                          <UserAvatar className={style.userAvatar} userAvatar={userMeta.avatar} imageSize={24} />
                          <UserLink user={userMeta} />
                        </div>
                      </Table.Cell>
                      <Table.Cell width={5}>{userMeta.email}</Table.Cell>
                      <Table.Cell width={3} textAlign="right">
                        <Checkbox
                          checked={isGroupAdmin}
                          readOnly={!hasPrivilege}
                          label={_(".group_admin")}
                          toggle
                          onChange={(e, { checked }) => onSetGroupAdmin(userMeta.id, checked)}
                        />
                      </Table.Cell>
                      <Table.Cell width={3} textAlign="right">
                        <Popup
                          disabled={pending || !(props.hasPermission && !isGroupAdmin)}
                          trigger={
                            <Icon
                              name="delete"
                              disabled={!(props.hasPermission && !isGroupAdmin)}
                              label={_(".remove_member")}
                            />
                          }
                          content={
                            <Button
                              negative
                              disabled={pending}
                              content={_(".confirm_remove_member")}
                              onClick={() => onRemoveUser(userMeta.id)}
                            />
                          }
                          on="click"
                          position="top center"
                        />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              )}
            </Table>
          </Segment>
        )}
      </Accordion.Content>
    </>
  );
};

interface GroupsPageProps {
  response: ApiTypes.GetGroupListResponseDto;
}

let GroupsPage: React.FC<GroupsPageProps> = props => {
  const _ = useLocalizer("groups");

  useEffect(() => {
    appState.enterNewPage(_(".title"), "members");
  }, [appState.locale]);

  const hasPrivilege = appState.currentUserHasPrivilege("ManageUserGroup");

  const [groups, setGroups] = useState(props.response.groups);
  const [groupsWithAdminPermission, setGroupsWithAdminPermission] = useState(props.response.groupsWithAdminPermission);

  const [createGroupName, setCreateGroupName] = useState("");
  const [createGroupPopupOpen, setCreateGroupPopupOpen] = useState(false);
  const [pendingCreateGroup, onCreateGroup] = useAsyncCallbackPending(async () => {
    const { requestError, response } = await api.group.createGroup({
      groupName: createGroupName
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      setGroups([
        ...groups,
        {
          id: response.groupId,
          name: createGroupName,
          memberCount: 0
        }
      ]);
      setGroupsWithAdminPermission([...groupsWithAdminPermission, response.groupId]);

      setCreateGroupName("");
      setCreateGroupPopupOpen(false);
    }
  });

  return (
    <>
      <div className={style.header}>
        <Header className="withIcon" icon="users" as="h1" content={_(".header")} />
        {hasPrivilege && (
          <Popup
            trigger={<Button className={style.createGroup} primary content={_(".create_group")} />}
            content={
              <Form>
                <Form.Input
                  style={{ width: 230 }}
                  placeholder={_(".create_group_name")}
                  value={createGroupName}
                  autoComplete="username"
                  readOnly={pendingCreateGroup}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCreateGroupName(e.target.value)}
                  onKeyPress={onEnterPress(() => onCreateGroup())}
                />
                <Button primary loading={pendingCreateGroup} onClick={onCreateGroup}>
                  {_(".confirm_create_group")}
                </Button>
              </Form>
            }
            open={createGroupPopupOpen}
            onOpen={() => setCreateGroupPopupOpen(true)}
            onClose={() => setCreateGroupPopupOpen(false)}
            on="click"
            position="bottom right"
          />
        )}
      </div>
      {groups.length > 0 ? (
        <Accordion>
          {groups.map(group => (
            <GroupItem
              key={group.id}
              meta={group}
              hasPermission={groupsWithAdminPermission.includes(group.id)}
              onDelete={() => {
                setGroups(groups.filter(({ id }) => id !== group.id));
                setGroupsWithAdminPermission(groupsWithAdminPermission.filter(id => id != group.id));
              }}
            />
          ))}
        </Accordion>
      ) : (
        <Segment placeholder>
          <Header icon>
            <Icon name="file" />
            {_(".no_groups")}
          </Header>
        </Segment>
      )}
    </>
  );
};

GroupsPage = observer(GroupsPage);

export default defineRoute(async request => {
  const response = await fetchData();
  return <GroupsPage response={response} />;
});

import React, { useMemo } from "react";
import { Menu, Icon, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useCurrentRoute } from "react-navi";
import { v4 as uuid } from "uuid";
import { redirect } from "navi";

import style from "./UserEdit.module.less";

import { appState } from "@/appState";
import { useLocalizer, useNavigationChecked, Link } from "@/utils/hooks";
import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import { isValidUsername } from "@/utils/validators";
import { makeToBeLocalizedText } from "@/locales";

enum EditType {
  Profile = "profile",
  Preference = "preference",
  Security = "security",
  Privilege = "privilege",
  Audit = "audit"
}

interface UserEditPageProps {
  username: string;
  type: EditType;
  data: unknown;
  view: React.FC<any>;
}

let UserEditPage: React.FC<UserEditPageProps> = props => {
  const _ = useLocalizer("user_edit");
  const currentRoute = useCurrentRoute();
  const navigation = useNavigationChecked();

  const View = props.view;

  const isEditingCurrentUser = useMemo(() => props.username === appState.currentUser?.username, []);

  const showPrivilegeTab =
    appState.currentUserPrivileges.length > 0 || appState.currentUser.isAdmin || props.type === EditType.Privilege;

  // If username is changed, navigate to the new url
  function onChangeUsername(newUsername: string) {
    // /u/:username/edit/profile
    // ["", "u", ":username", "edit", "profile"]
    // The :username is [2]
    const splitted = currentRoute.url.pathname.split("/");
    splitted[2] = newUsername;
    navigation.navigate(splitted.join("/"));
  }

  return (
    <>
      <div className={style.container}>
        <div className={style.menu}>
          <Menu secondary vertical>
            <Menu.Item active={props.type === EditType.Profile} as={Link} href="../profile">
              <Icon name="user" />
              {_(".menu.profile")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Preference} as={Link} href="../preference">
              <Icon name="setting" />
              {_(".menu.preference")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Security} as={Link} href="../security">
              <Icon name="lock" />
              {_(".menu.security")}
            </Menu.Item>
            {showPrivilegeTab && (
              <Menu.Item active={props.type === EditType.Privilege} as={Link} href="../privilege">
                <Icon name="key" />
                {_(".menu.privilege")}
              </Menu.Item>
            )}
            <Menu.Item active={props.type === EditType.Audit} as={Link} href="../audit">
              <Icon.Group>
                <Icon name="list alternate" />
                <Icon corner name="check" />
              </Icon.Group>
              {_(".menu.audit")}
            </Menu.Item>
          </Menu>
          {!isEditingCurrentUser && <Message className={style.adminWarning} content={_(".admin_warning")} warning />}
          <Link href="../..">
            <Icon name="arrow left" />
            {!isEditingCurrentUser ? _(".back_to_profile_of_user") : _(".back_to_profile")}
          </Link>
        </div>
        <div className={style.main}>
          <View {...props.data} onChangeUsername={onChangeUsername} />
        </div>
      </div>
    </>
  );
};

UserEditPage = observer(UserEditPage);

async function getView(username: string, type: EditType, query: Record<string, string>) {
  if (!Object.values(EditType).includes(type)) type = EditType.Profile;

  const { fetchData, View } = await {
    [EditType.Profile]: () => import("./ProfileView"),
    [EditType.Preference]: () => import("./PreferenceView"),
    [EditType.Security]: () => import("./SecurityView"),
    [EditType.Privilege]: () => import("./PrivilegeView"),
    [EditType.Audit]: () => import("./AuditView")
  }[type]();

  const response = await fetchData(username, query);

  return <UserEditPage key={uuid()} username={username} type={type} data={response} view={View} />;
}

export default defineRoute(async request => {
  const username = decodeURIComponent(request.params.username);
  if (!isValidUsername(username)) throw new RouteError(makeToBeLocalizedText(`user_edit.errors.NO_SUCH_USER`));
  return await getView(request.params.username, request.params.type as EditType, request.query);
});

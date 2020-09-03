import React from "react";
import { Menu, Icon, Message } from "semantic-ui-react";
import { observer } from "mobx-react";
import { Link } from "react-navi";

import style from "./UserEdit.module.less";

import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";
import { defineRoute } from "@/AppRouter";

enum EditType {
  Profile = "profile",
  Preference = "preference",
  Security = "security",
  Privilege = "privilege",
  Audit = "audit"
}

interface UserEditPageProps {
  userId: number;
  type: EditType;
  data: unknown;
  view: React.FC<unknown>;
}

let UserEditPage: React.FC<UserEditPageProps> = props => {
  const _ = useIntlMessage("user_edit");

  const View = props.view;

  const isEditingCurrentUser = props.userId === appState.currentUser.id;

  const showPrivilegeTab =
    appState.currentUserPrivileges.length > 0 || appState.currentUser.isAdmin || props.type === EditType.Privilege;

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
          <View {...props.data} />
        </div>
      </div>
    </>
  );
};

UserEditPage = observer(UserEditPage);

export default defineRoute(async request => {
  let type = request.params.type as EditType;
  if (!Object.values(EditType).includes(type)) type = EditType.Profile;

  const { fetchData, View } = await {
    [EditType.Profile]: import("./ProfileView"),
    [EditType.Preference]: import("./PreferenceView"),
    [EditType.Security]: import("./SecurityView"),
    [EditType.Privilege]: import("./PrivilegeView"),
    [EditType.Audit]: import("./AuditView")
  }[type];

  const userId = Number(request.params.userId) || 0;
  const response = await fetchData(userId, request.query);

  return <UserEditPage userId={userId} type={type} data={response} view={View} />;
});

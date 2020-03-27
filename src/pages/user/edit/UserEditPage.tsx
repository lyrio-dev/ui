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
  Privilege = "privilege"
}

type DataTypes =
  | ApiTypes.GetUserProfileResponseDto
  | ApiTypes.GetUserPreferenceResponseDto
  | ApiTypes.GetUserSecuritySettingsResponseDto
  | ApiTypes.GetUserMetaResponseDto;
interface UserEditPageProps {
  type: EditType;
  data: DataTypes;
  view: React.FC<DataTypes>;
}

let UserEditPage: React.FC<UserEditPageProps> = props => {
  const _ = useIntlMessage();

  const View = props.view;

  const isEditingCurrentUser = props.data.meta.id === appState.currentUser.id;

  const showPrivilegeTab =
    appState.currentUserPrivileges.length > 0 || appState.currentUser.isAdmin || props.type === EditType.Privilege;

  return (
    <>
      <div className={style.container}>
        <div className={style.menu}>
          <Menu secondary vertical>
            <Menu.Item active={props.type === EditType.Profile} as={Link} href="../profile">
              <Icon name="user" />
              {_("user_edit.menu.profile")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Preference} as={Link} href="../preference">
              <Icon name="setting" />
              {_("user_edit.menu.preference")}
            </Menu.Item>
            <Menu.Item active={props.type === EditType.Security} as={Link} href="../security">
              <Icon name="lock" />
              {_("user_edit.menu.security")}
            </Menu.Item>
            {showPrivilegeTab && (
              <Menu.Item active={props.type === EditType.Privilege} as={Link} href="../privilege">
                <Icon name="key" />
                {_("user_edit.menu.privilege")}
              </Menu.Item>
            )}
          </Menu>
          {!isEditingCurrentUser && (
            <Message className={style.adminWarning} content={_("user_edit.admin_warning")} warning />
          )}
          <Link href="../..">
            <Icon name="arrow left" />
            {!isEditingCurrentUser ? _("user_edit.back_to_profile_of_user") : _("user_edit.back_to_profile")}
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
    [EditType.Privilege]: import("./PrivilegeView")
  }[type];

  const response = await fetchData(parseInt(request.params.userId) || 0);

  return <UserEditPage type={type} data={response} view={View} />;
});

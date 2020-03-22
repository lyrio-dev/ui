import React, { useEffect } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { route } from "navi";
import { Link } from "react-navi";

import style from "./UserEdit.module.less";

import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";

enum EditType {
  Profile = "profile",
  Preference = "preference",
  Security = "security"
}

type DataTypes =
  | ApiTypes.GetUserProfileResponseDto
  | ApiTypes.GetUserPreferenceResponseDto
  | ApiTypes.GetUserSecuritySettingsResponseDto;
interface UserEditPageProps {
  type: EditType;
  data: DataTypes;
  view: React.FC<DataTypes>;
}

let UserEditPage: React.FC<UserEditPageProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(`${_(`user_edit.title.${props.type}`)} - ${props.data.meta.username}`, false);
  }, [appState.locale]);

  const View = props.view;

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
          </Menu>
          <Link href="../..">
            <Icon name="arrow left" />
            {_("user_edit.back_to_profile")}
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

export default route({
  async getView(request) {
    let type = request.params.type as EditType;
    if (!Object.values(EditType).includes(type)) type = EditType.Profile;

    const { fetchData, View } = await {
      [EditType.Profile]: import("./ProfileView"),
      [EditType.Preference]: import("./PreferenceView"),
      [EditType.Security]: import("./SecurityView")
    }[type];

    const response = await fetchData(parseInt(request.params.userId) || 0);
    if (!response) return null;

    return <UserEditPage type={type} data={response} view={View} />;
  }
});

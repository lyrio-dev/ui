import React, { useState, useEffect } from "react";
import { Header, Checkbox, Button } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage } from "@/utils/hooks";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserMeta({ userId, getPrivileges: true });
  if (requestError || response.error) {
    toast.error(requestError || response.error);
    return null;
  }

  return response;
}

enum Privilege {
  MANAGE_USER = "MANAGE_USER",
  MANAGE_USER_GROUP = "MANAGE_USER_GROUP",
  MANAGE_PROBLEM = "MANAGE_PROBLEM",
  MANAGE_CONTEST = "MANAGE_CONTEST",
  MANAGE_DISCUSSION = "MANAGE_DISCUSSION"
}

interface PrevilegeViewProps {
  meta?: ApiTypes.UserMetaDto;
  privileges?: ApiTypes.GetUserMetaResponseDto["privileges"];
}

const PrevilegeView: React.FC<PrevilegeViewProps> = props => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(`${_(`user_edit.privilege.title`)} - ${props.meta.username}`, false);
  }, [appState.locale]);

  const [pending, setPending] = useState(false);
  async function onSubmit() {
    if (pending) return;
    setPending(true);

    const { requestError, response } = await UserApi.setUserPrivileges({
      userId: props.meta.id,
      privileges: [...privileges]
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`user_edit.error.${response.error}`));
    else {
      toast.success(_("user_edit.privilege.success"));
    }

    setPending(false);
  }

  const [privileges, setPrivileges] = useState(new Set(props.privileges as Privilege[]));
  function togglePrivilege(privilege: Privilege, has: boolean) {
    const newPrivileges = new Set(privileges);
    if (has) newPrivileges.add(privilege);
    else newPrivileges.delete(privilege);
    setPrivileges(newPrivileges);
  }

  const isAdmin = appState.currentUser.isAdmin;

  return (
    <>
      <Header className={style.sectionHeader} size="large" content={_("user_edit.privilege.header")} />
      {Object.values(Privilege).map(privilege => (
        <div key={privilege} className={style.privilegeRow}>
          <Checkbox
            toggle
            readOnly={!isAdmin}
            label={_(`user_edit.privilege.privileges.${privilege}.name`)}
            checked={privileges.has(privilege)}
            onChange={(e, { checked }) => togglePrivilege(privilege, checked)}
          />
          <div className={style.notes}>{_(`user_edit.privilege.privileges.${privilege}.notes`)}</div>
        </div>
      ))}
      <div className={style.notes + " " + style.notesAdminOnly}>{_("user_edit.privilege.admin_only")}</div>
      <Button
        className={style.submit}
        loading={pending}
        disabled={!isAdmin}
        primary
        content={_("user_edit.privilege.submit")}
        onClick={onSubmit}
      />
    </>
  );
};

export const View = observer(PrevilegeView);

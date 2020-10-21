import React, { useState, useEffect } from "react";
import { Header, Checkbox, Button } from "semantic-ui-react";
import { observer } from "mobx-react";
import { FormattedMessage } from "react-intl";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useAsyncCallbackPending, useIntlMessage } from "@/utils/hooks";
import { RouteError } from "@/AppRouter";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserMeta({ userId, getPrivileges: true });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`user_edit.errors.${response.error}`} />);

  return response;
}

enum Privilege {
  ManageUser = "ManageUser",
  ManageUserGroup = "ManageUserGroup",
  ManageProblem = "ManageProblem",
  ManageContest = "ManageContest",
  ManageDiscussion = "ManageDiscussion"
}

interface PrevilegeViewProps {
  meta?: ApiTypes.UserMetaDto;
  privileges?: ApiTypes.GetUserMetaResponseDto["privileges"];
}

const PrevilegeView: React.FC<PrevilegeViewProps> = props => {
  const _ = useIntlMessage("user_edit.privilege");

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.meta.username}`, null, false);
  }, [appState.locale]);

  const [pending, onSubmit] = useAsyncCallbackPending(async () => {
    const { requestError, response } = await UserApi.setUserPrivileges({
      userId: props.meta.id,
      privileges: [...privileges]
    });
    if (requestError) toast.error(requestError);
    else if (response.error) toast.error(_(`user_edit.errors.${response.error}`));
    else {
      toast.success(_(".success"));
    }
  });

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
      <Header className={style.sectionHeader} size="large" content={_(".header")} />
      {Object.values(Privilege).map(privilege => (
        <div key={privilege} className={style.privilegeRow}>
          <Checkbox
            toggle
            readOnly={!isAdmin}
            label={_(`.privileges.${privilege}.name`)}
            checked={privileges.has(privilege)}
            onChange={(e, { checked }) => togglePrivilege(privilege, checked)}
          />
          <div className={style.notes}>{_(`.privileges.${privilege}.notes`)}</div>
        </div>
      ))}
      <div className={style.notes + " " + style.notesAdminOnly}>{_(".admin_only")}</div>
      <Button
        className={style.submit}
        loading={pending}
        disabled={!isAdmin}
        primary
        content={_(".submit")}
        onClick={onSubmit}
      />
    </>
  );
};

export const View = observer(PrevilegeView);

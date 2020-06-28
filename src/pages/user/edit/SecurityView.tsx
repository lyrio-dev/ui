import React, { useState, useEffect } from "react";
import { Header, Button, Input } from "semantic-ui-react";
import { observer } from "mobx-react";
import { Validator, isEmail } from "class-validator";
import { FormattedMessage } from "react-intl";

import style from "./UserEdit.module.less";

import { UserApi } from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useIntlMessage, useFieldCheckSimple } from "@/utils/hooks";
import { isValidPassword } from "@/utils/validators";
import { RouteError } from "@/AppRouter";

export async function fetchData(userId: number) {
  const { requestError, response } = await UserApi.getUserSecuritySettings({ userId });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(<FormattedMessage id={`user_edit.error.${response.error}`} />);

  return response;
}

interface SecurityViewProps {
  meta?: ApiTypes.UserMetaDto;
}

const SecurityView: React.FC<SecurityViewProps> = props => {
  const _ = useIntlMessage("user_edit.security");

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.meta.username}`, false);
  }, [appState.locale]);

  const hasPrivilege = appState.currentUser.isAdmin || appState.currentUserPrivileges.includes("MANAGE_USER");

  // Start change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");

  const [checkOldPassword, oldPasswordInvalid] = useFieldCheckSimple(
    oldPassword,
    value => isValidPassword(value) || (!value && !newPassword)
  );
  const [checkNewPassword, newPasswordInvalid] = useFieldCheckSimple(
    newPassword,
    value => isValidPassword(value) || !value
  );
  const [checkRetypePassword, retypePasswordInvalid] = useFieldCheckSimple(
    retypePassword,
    value => value === newPassword || !value
  );

  // Errors
  const [wrongOldPassword, setWrongOldPassword] = useState(false);
  const [emptyNewPassword, setEmptyNewPassword] = useState(false);
  const [emptyRetypePassword, setEmptyRetypePassword] = useState(false);

  function checkPasswordInputs() {
    checkOldPassword();
    checkNewPassword();
    checkRetypePassword();
  }

  const [pendingChangePassword, setPendingChangePassword] = useState(false);

  async function onSubmitChangePassword() {
    if (pendingChangePassword) return;
    setPendingChangePassword(true);

    if ((oldPasswordInvalid && !hasPrivilege) || newPasswordInvalid || retypePasswordInvalid) {
    } else if (!newPassword) setEmptyNewPassword(true);
    else if (!retypePassword) setEmptyRetypePassword(true);
    else {
      const { requestError, response } = await UserApi.updateUserPassword({
        userId: props.meta.id,
        oldPassword: oldPassword || null,
        password: newPassword
      });
      if (requestError) toast.error(requestError);
      else if (response.error === "WRONG_OLD_PASSWORD") {
        setWrongOldPassword(true);
      } else if (response.error) toast.error(_(`user_edit.error.${response.error}`));
      else {
        toast.success(_(".password.success"));

        setOldPassword("");
        setNewPassword("");
        setRetypePassword("");
        setWrongOldPassword(false);
        setEmptyNewPassword(false);
        setEmptyRetypePassword(false);
      }
    }

    setPendingChangePassword(false);
  }
  // End change password

  // Start change email
  // TODO: add email verify
  const [email, setEmail] = useState(props.meta.email);
  const [checkEmail, emailInvalid] = useFieldCheckSimple(email, value => isEmail(value));

  // Errors
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  const [pendingChangeEmail, setPendingChangeEmail] = useState(false);

  async function onSubmitChangeEmail() {
    if (pendingChangeEmail) return;
    setPendingChangeEmail(true);

    if (emailInvalid) {
    } else {
      const { requestError, response } = await UserApi.updateUserEmail({
        userId: props.meta.id,
        email: email
      });
      if (requestError) toast.error(requestError);
      else if (response.error === "DUPLICATE_EMAIL") setDuplicateEmail(true);
      else if (response.error) toast.error(_(`user_edit.error.${response.error}`));
      else {
        toast.success(_(".email.success"));

        if (props.meta.id === appState.currentUser.id) {
          appState.currentUser.email = email;
        }
      }
    }

    setPendingChangeEmail(false);
  }
  // End change email

  return (
    <>
      <form>
        <Header className={style.sectionHeader} size="large" content={_(".password.header")} />
        <input readOnly type="text" hidden autoComplete="username" value={props.meta.username} />
        {!hasPrivilege && (
          <>
            <Header className={style.header} size="tiny" content={_(".password.old")} />
            <Input
              className={style.notFullWidth}
              fluid
              value={oldPassword}
              type="password"
              autoComplete="current-password"
              onChange={(e, { value }) => !pendingChangePassword && (setOldPassword(value), setWrongOldPassword(false))}
              onBlur={checkPasswordInputs}
              error={oldPasswordInvalid || wrongOldPassword}
            />
            <div className={style.notes}>
              {wrongOldPassword
                ? _(".password.wrong_old_password")
                : oldPasswordInvalid && _(".password.invalid_password")}
            </div>
          </>
        )}
        <Header className={style.header} size="tiny" content={_(".password.new")} />
        <Input
          className={style.notFullWidth}
          fluid
          value={newPassword}
          type="password"
          autoComplete="new-password"
          onChange={(e, { value }) => !pendingChangePassword && (setNewPassword(value), setEmptyNewPassword(false))}
          onBlur={checkPasswordInputs}
          error={newPasswordInvalid || emptyNewPassword}
        />
        <div className={style.notes}>
          {emptyNewPassword ? _(".password.empty_new_password") : newPasswordInvalid && _(".password.invalid_password")}
        </div>
        <Header className={style.header} size="tiny" content={_(".password.retype")} />
        <Input
          className={style.notFullWidth}
          fluid
          value={retypePassword}
          type="password"
          autoComplete="new-password"
          onChange={(e, { value }) =>
            !pendingChangePassword && (setRetypePassword(value), setEmptyRetypePassword(false))
          }
          onBlur={checkPasswordInputs}
          error={retypePasswordInvalid || emptyRetypePassword}
        />
        <div className={style.notes}>
          {emptyRetypePassword
            ? _(".password.empty_retype_password")
            : retypePasswordInvalid && _(".password.passwords_do_not_match")}
        </div>
      </form>
      <Button
        className={style.submit}
        loading={pendingChangePassword}
        primary
        content={_(".password.submit")}
        onClick={onSubmitChangePassword}
      />
      <Header className={style.sectionHeader} size="large" content={_(".email.header")} />
      <Header className={style.header} size="tiny" content={_(".email.email")} />
      <Input
        className={style.notFullWidth}
        fluid
        value={email}
        onChange={(e, { value }) => !pendingChangeEmail && (setEmail(value), setDuplicateEmail(false))}
        onBlur={checkEmail}
        error={emailInvalid || duplicateEmail}
      />
      <div className={style.notes}>
        {emailInvalid ? _(".email.invalid_email") : duplicateEmail && _(".email.duplicate_email")}
      </div>
      <Button
        className={style.submit}
        loading={pendingChangeEmail}
        primary
        content={_(".email.submit")}
        onClick={onSubmitChangeEmail}
      />
    </>
  );
};

export const View = observer(SecurityView);

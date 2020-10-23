import React, { useState, useEffect, useRef } from "react";
import { Header, Button, Input, Segment, Icon, SegmentGroup, Label, Popup } from "semantic-ui-react";
import { observer } from "mobx-react";
import { isEmail } from "class-validator";
import { UAParser } from "ua-parser-js";
import * as timeago from "timeago.js";

import style from "./UserEdit.module.less";

import api from "@/api";
import { appState } from "@/appState";
import toast from "@/utils/toast";
import { useLocalizer, useFieldCheckSimple, useAsyncCallbackPending } from "@/utils/hooks";
import { isValidPassword } from "@/utils/validators";
import { RouteError } from "@/AppRouter";
import fixChineseSpace from "@/utils/fixChineseSpace";
import formatDateTime from "@/utils/formatDateTime";
import { makeToBeLocalizedText } from "@/locales";

export async function fetchData(userId: number) {
  const result = {};

  for (const { requestError, response } of await Promise.all([
    api.user.getUserSecuritySettings({ userId }),
    api.auth.listUserSessions({ userId })
  ])) {
    if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
    else if (response.error) throw new RouteError(makeToBeLocalizedText(`user_edit.errors.${response.error}`));
    Object.assign(result, response);
  }

  return result;
}

interface SecurityViewProps {
  meta?: ApiTypes.UserMetaDto;
  sessions?: ApiTypes.UserSessionDto[];
  currentSessionId?: number;
}

const SecurityView: React.FC<SecurityViewProps> = props => {
  const _ = useLocalizer("user_edit.security");

  useEffect(() => {
    appState.enterNewPage(`${_(`.title`)} - ${props.meta.username}`, null, false);
  }, [appState.locale]);

  const hasPrivilege = appState.currentUser.isAdmin || appState.currentUserPrivileges.includes("ManageUser");

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

  const [pendingChangePassword, onSubmitChangePassword] = useAsyncCallbackPending(async () => {
    if ((oldPasswordInvalid && !hasPrivilege) || newPasswordInvalid || retypePasswordInvalid) {
    } else if (!newPassword) setEmptyNewPassword(true);
    else if (!retypePassword) setEmptyRetypePassword(true);
    else {
      const { requestError, response } = await api.user.updateUserPassword({
        userId: props.meta.id,
        oldPassword: oldPassword || null,
        password: newPassword
      });
      if (requestError) toast.error(requestError(_));
      else if (response.error === "WRONG_OLD_PASSWORD") {
        setWrongOldPassword(true);
      } else if (response.error) toast.error(_(`user_edit.errors.${response.error}`));
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
  });
  // End change password

  // Start change email
  const [email, setEmail] = useState(props.meta.email);
  const [checkEmail, emailInvalid] = useFieldCheckSimple(email, value => isEmail(value));

  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [sendEmailVerificationCodeTimeout, setSendEmailVerificationCodeTimeout] = useState(0);

  const [emailVerificationCodeError, setEmailVerificationCodeError] = useState(false);
  const [sendEmailVerificationCodePending, onSendEmailVerificationCode] = useAsyncCallbackPending(async () => {
    if (emailInvalid || email.toLowerCase() === appState.currentUser.email.toLowerCase()) {
    } else {
      const { requestError, response } = await api.auth.sendEmailVerifactionCode({
        email: email,
        type: "ChangeEmail",
        locale: appState.locale
      });
      if (requestError) toast.error(requestError(_));
      else if (response.error === "DUPLICATE_EMAIL") setDuplicateEmail(true);
      else if (response.error)
        toast.error(_(`user_edit.errors.${response.error}`, { errorMessage: response.errorMessage }));
      else {
        toast.success(_(".email.verification_code_sent"));
        setSendEmailVerificationCodeTimeout(61);
      }
    }
  });

  useEffect(() => {
    const id = setInterval(() => {
      if (sendEmailVerificationCodeTimeout) setSendEmailVerificationCodeTimeout(timeout => timeout - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  function onChangeVerificationCode(code: string) {
    setEmailVerificationCodeError(false);
    setEmailVerificationCode(code);
  }

  // Errors
  const [duplicateEmail, setDuplicateEmail] = useState(false);

  const [pendingChangeEmail, onSubmitChangeEmail] = useAsyncCallbackPending(async () => {
    if (emailInvalid || email.toLowerCase() === appState.currentUser.email.toLowerCase()) {
    } else {
      const { requestError, response } = await api.user.updateUserSelfEmail({
        email: email,
        emailVerificationCode: emailVerificationCode
      });
      if (requestError) toast.error(requestError(_));
      else if (response.error === "DUPLICATE_EMAIL") setDuplicateEmail(true);
      else if (response.error === "INVALID_EMAIL_VERIFICATION_CODE") setEmailVerificationCodeError(true);
      else if (response.error) toast.error(_(`user_edit.errors.${response.error}`));
      else {
        toast.success(_(".email.success"));

        if (props.meta.id === appState.currentUser.id) {
          appState.currentUser.email = email;
        }

        setEmailVerificationCode("");
        setEmailVerificationCodeError(false);
        setSendEmailVerificationCodeTimeout(0);
      }
    }
  });
  // End change email

  // Start session management
  const [timeAgoRelativeDate, setTimeAgoRelativeDate] = useState(new Date());
  // Refersh the time every minute
  useEffect(() => {
    const id = setInterval(() => setTimeAgoRelativeDate(new Date()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const [sessions, setSessions] = useState(props.sessions);
  const [revokeAllPopupOpen, setRevokeAllPopupOpen] = useState(false);
  const [, onRevokeSession] = useAsyncCallbackPending(async (sessionId?: number) => {
    const { requestError, response } = await api.auth.revokeUserSession({
      userId: props.meta.id,
      sessionId
    });
    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`user_edit.errors.${response.error}`));
    else {
      if (!sessionId) {
        if (props.meta.id === appState.currentUser.id) toast.success(_(".sessions.success_revoke_all_current_user"));
        else toast.success(_(".sessions.success_revoke_all"));

        setSessions(sessions.filter(session => session.sessionId === props.currentSessionId));
      } else {
        toast.success(_(".sessions.success_revoke"));

        setSessions(sessions.filter(session => session.sessionId !== sessionId));
      }
    }

    setRevokeAllPopupOpen(false);
  });
  // End session management

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
      {props.meta.id === appState.currentUser.id && (
        <>
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
          {appState.serverPreference.security.requireEmailVerification && (
            <>
              <Header className={style.header} size="tiny" content={_(".email.email_verification_code")} />
              <Input
                className={style.notFullWidth}
                fluid
                value={emailVerificationCode}
                onChange={(e, { value }) => !pendingChangeEmail && onChangeVerificationCode(value)}
                error={emailVerificationCodeError}
                action={
                  <Button
                    disabled={sendEmailVerificationCodeTimeout !== 0}
                    loading={sendEmailVerificationCodePending}
                    content={
                      sendEmailVerificationCodeTimeout
                        ? `${sendEmailVerificationCodeTimeout > 60 ? 60 : sendEmailVerificationCodeTimeout}s`
                        : _(".email.send_email_verification_code")
                    }
                    onClick={onSendEmailVerificationCode}
                  />
                }
              />
              <div className={style.notes}>
                {emailVerificationCodeError && _(".email.invalid_email_verification_code")}
              </div>
            </>
          )}
          <Button
            className={style.submit}
            loading={pendingChangeEmail}
            primary
            content={_(".email.submit")}
            onClick={onSubmitChangeEmail}
          />
        </>
      )}
      <Header
        className={style.sectionHeader + " " + style.bottomAttached}
        size="large"
        content={
          <>
            <span className={style.text}>{_(".sessions.header")}</span>
            {sessions.some(session => session.sessionId !== props.currentSessionId) && (
              <Popup
                trigger={<Button basic negative className={style.revokeAll} content={_(".sessions.revoke_all")} />}
                content={
                  <Button content={_(".sessions.confirm_revoke_all")} negative onClick={() => onRevokeSession()} />
                }
                open={revokeAllPopupOpen}
                onOpen={() => setRevokeAllPopupOpen(true)}
                onClose={() => setRevokeAllPopupOpen(false)}
                on="click"
                position="top center"
              />
            )}
          </>
        }
      />
      {sessions.length ? (
        <SegmentGroup className={style.sessionList}>
          {sessions
            .sort((a, b) => b.lastAccessTime - a.lastAccessTime)
            .map(session => {
              const isCurrentSession = session.sessionId === props.currentSessionId;

              const ua = new UAParser(session.userAgent).getResult();

              // Parse UA icon
              const icon = (() => {
                const deviceTypeMap = {
                  console: "terminal",
                  mobile: "mobile alternate",
                  wearable: "mobile alternate",
                  embedded: "mobile alternate",
                  tablet: "tablet alternate",
                  smarttv: "desktop"
                };
                const osNameMap = {
                  Windows: "windows",
                  "Mac OS": "apple",
                  Ubuntu: "ubuntu",
                  CentOS: "centos",
                  SUSE: "suse",
                  Fedora: "fedora"
                };
                if (ua.device.type in deviceTypeMap) return deviceTypeMap[ua.device.type];
                if (ua.os.name in osNameMap) return osNameMap[ua.os.name];
                if (/BSD/.test(ua.os.name)) return "freebsd";
                if (/linux/i.test(ua.ua)) return "linux";
                return "desktop";
              })();

              const os = ua.os.name ? ua.os.name + (ua.os.version ? " " + ua.os.version : "") : "";
              const browser = ua.browser.name
                ? ua.browser.name + (ua.browser.version ? " " + ua.browser.version : "")
                : "";

              return (
                <Segment key={session.sessionId} className={style.sessionListItem}>
                  <Label
                    className={style.light}
                    size="small"
                    empty
                    circular
                    color={isCurrentSession ? "green" : "grey"}
                  />
                  <div className={style.iconWrapper}>
                    <Icon name={icon as any} />
                  </div>
                  <div className={style.info}>
                    <div className={style.browserAndOs} title={session.userAgent}>
                      {os || browser ? (
                        <>
                          <span className={style.os}>{os}</span>
                          <span className={style.browser}>{browser}</span>
                        </>
                      ) : (
                        _(".sessions.unknown_os_browser")
                      )}
                    </div>
                    <div className={style.lastActive}>
                      {isCurrentSession ? (
                        _(".sessions.current")
                      ) : (
                        <span title={formatDateTime(session.lastAccessTime)[1]}>
                          {fixChineseSpace(
                            _(".sessions.last_active", {
                              time: timeago.format(session.lastAccessTime, appState.locale, {
                                relativeDate: timeAgoRelativeDate
                              })
                            })
                          )}
                        </span>
                      )}
                    </div>
                    <div className={style.loginIpLocationTime}>
                      <span className={style.loginIpLocation}>
                        {fixChineseSpace(
                          _(session.loginIpLocation ? ".sessions.login_ip_location" : ".sessions.login_ip", {
                            ip: session.loginIp,
                            location: session.loginIpLocation
                          })
                        )}
                      </span>
                      <span className={style.time} title={formatDateTime(session.loginTime)[1]}>
                        {timeago.format(session.loginTime, appState.locale, { relativeDate: timeAgoRelativeDate })}
                      </span>
                    </div>
                  </div>
                  {props.currentSessionId !== session.sessionId && (
                    <Popup
                      trigger={<Button content={_(".sessions.revoke")} />}
                      content={
                        <Button
                          negative
                          content={_(".sessions.confirm_revoke")}
                          onClick={() => onRevokeSession(session.sessionId)}
                        />
                      }
                      on="click"
                      position="left center"
                    />
                  )}
                </Segment>
              );
            })}
        </SegmentGroup>
      ) : (
        <Segment placeholder>
          <Header icon>
            <>
              <Icon name="search" />
              {_(".sessions.no_sessions")}
            </>
          </Header>
        </Segment>
      )}
      {props.meta.id === appState.currentUser.id && (
        <div className={style.notes}>{_(".sessions.notes_current_user")}</div>
      )}
    </>
  );
};

export const View = observer(SecurityView);

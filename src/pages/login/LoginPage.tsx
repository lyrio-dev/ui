import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Icon, Input, Button, Checkbox, Form, message } from "antd";
import { useHistory } from "react-router";

import style from "./LoginPage.module.less";
import LoginLogo from "@/assets/syzoj-login-logo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage } from "@/utils/hooks";

const LoginPage: React.FC = () => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.title = _("login.title");
  });

  const [requestStatus, setRequestStatus] = useState({ success: false, error: { type: "", message: "" } });
  const setError = (type: "username" | "password", message: string) =>
    setRequestStatus({ success: false, error: { type, message } });
  const setSuccess = () => setRequestStatus({ success: true, error: null });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [pending, setPending] = useState(false);

  const refUsername = useRef<Input>(null),
    refPassword = useRef<Input>(null);

  const history = useHistory();

  async function onSubmit() {
    if (pending) return;
    setPending(true);

    if (username.length === 0) {
      setError("username", _("login.empty_username"));
    } else if (!/^[a-zA-Z0-9\-_.#$]{3,24}$/.test(username)) {
      setError("username", _("login.invalid_username"));
    } else if (password.length === 0) {
      setError("password", _("login.empty_password"));
    } else if (password.length < 6 || password.length > 32) {
      setError("password", _("login.invalid_password"));
    } else {
      // Send login request
      const { requestError, response } = await AuthApi.login({ username, password });

      if (requestError) message.error(requestError);
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            message.error(_("login.already_loggedin"));
            break;
          case "NO_SUCH_USER":
            setError("username", _("login.no_such_user"));
            break;
          case "WRONG_PASSWORD":
            setError("password", _("login.wrong_password"));
            break;
        }
      } else {
        // Login success
        message.success(_("login.welcome", { username }));
        appState.loggedInUser = response.userMeta;
        appState.token = response.token;
        setSuccess();

        setTimeout(() => {
          history.push(appState.loginRedirectUrl || "/");
        }, 1000);
      }
    }

    setPending(false);
  }

  return (
    <div className={style.wrapper}>
      <LoginLogo className={style.logo} />
      <div className={style.row}>
        <Form.Item
          validateStatus={
            requestStatus.success
              ? "success"
              : requestStatus.error && requestStatus.error.type === "username"
              ? "error"
              : ""
          }
          hasFeedback
          help={requestStatus.error && requestStatus.error.type === "username" ? requestStatus.error.message : ""}
        >
          <Input
            size="large"
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder={_("login.username")}
            value={username}
            onChange={e => setUsername(e.target.value)}
            onPressEnter={() => {
              refPassword.current.input.focus();
              refPassword.current.input.select();
            }}
            ref={refUsername}
          />
        </Form.Item>
      </div>
      <div className={style.row}>
        <Form.Item
          validateStatus={
            requestStatus.success
              ? "success"
              : requestStatus.error && requestStatus.error.type === "password"
              ? "error"
              : ""
          }
          hasFeedback
          help={requestStatus.error && requestStatus.error.type === "password" ? requestStatus.error.message : ""}
        >
          <Input
            size="large"
            prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
            type="password"
            placeholder={_("login.password")}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onPressEnter={onSubmit}
            ref={refPassword}
          />
        </Form.Item>
      </div>
      <div className={style.compactRow}>
        <Checkbox disabled checked={remember} onChange={e => setRemember(e.target.checked)}>
          <FormattedMessage id="login.remember" />
        </Checkbox>
        <a className={style.forgetLink}>
          <FormattedMessage id="login.forget" />
        </a>
      </div>
      <div className={style.compactRow}>
        <Button size="large" type="primary" block loading={pending} onClick={onSubmit}>
          <FormattedMessage id="login.login" />
        </Button>
      </div>
    </div>
  );
};

export default LoginPage;

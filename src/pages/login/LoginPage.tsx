import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Icon, Input, Button, Checkbox, Form, message } from "antd";
import { useHistory } from "react-router";

import style from "./LoginPage.module.less";
import LoginLogo from "@/assets/syzoj-login-logo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage } from "@/utils/hooks";
import { isValidUsername, isValidPassword } from "@/utils/validators";

const LoginPage: React.FC = () => {
  const _ = useIntlMessage();

  const history = useHistory();
  const redirect = () => {
    history.push(appState.loginRedirectUrl || "/");
  };

  useEffect(() => {
    if (appState.loggedInUser) redirect();
  }, []);

  useEffect(() => {
    appState.title = _("login.title");
  }, [appState.locale]);

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

  async function onSubmit() {
    if (pending) return;
    setPending(true);

    if (username.length === 0) {
      setError("username", _("login.empty_username"));
    } else if (!isValidUsername(username)) {
      setError("username", _("login.invalid_username"));
    } else if (password.length === 0) {
      setError("password", _("login.empty_password"));
    } else if (!isValidPassword(password)) {
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
            refUsername.current.input.focus();
            refUsername.current.input.select();
            break;
          case "WRONG_PASSWORD":
            setError("password", _("login.wrong_password"));
            refPassword.current.input.focus();
            refPassword.current.input.select();
            break;
        }
      } else {
        // Login success
        message.success(_("login.welcome", { username }));
        appState.loggedInUser = response.userMeta;
        appState.token = response.token;
        setSuccess();

        setTimeout(() => {
          redirect();
        }, 1000);

        return;
      }
    }

    setPending(false);
  }

  return (
    <Form className={style.wrapper}>
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
            autoComplete="username"
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
            autoComplete="current-password"
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
      <div className={style.buttonRow}>
        <Button size="large" type="primary" block loading={pending} onClick={onSubmit}>
          <FormattedMessage id="login.login" />
        </Button>
      </div>
    </Form>
  );
};

export default LoginPage;

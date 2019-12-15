import React, { useEffect, useState, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Icon, Input, Button, Form, message } from "antd";
import { useHistory } from "react-router";

import style from "./RegisterPage.module.less";
import LoginLogo from "@/assets/syzoj-login-logo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage, useFieldCheck } from "@/utils/hooks";
import { isValidUsername, isValidEmail, isValidPassword } from "@/utils/validators";

const RegisterPage: React.FC = () => {
  const _ = useIntlMessage();

  const history = useHistory();
  const redirect = () => {
    history.push(appState.loginRedirectUrl || "/");
  };

  useEffect(() => {
    if (appState.loggedInUser) redirect();
  }, []);

  useEffect(() => {
    appState.title = _("register.title");
  }, [appState.locale]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  // const [emailVerifyCode, setEmailVerifyCode] = useState("");
  // const [sendPending, setSendPending] = useState(false);
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [registerPending, setRegisterPending] = useState(false);

  const refUsername = useRef<Input>();
  const refEmail = useRef<Input>();
  // const refEmailVerifyCode = useRef<Input>();
  const refPassword = useRef<Input>();
  const refRetypePassword = useRef<Input>();

  // usernameCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkUsername, waitForUsernameCheck, getUsernameUIValidateStatus, getUsernameUIHelp] = useFieldCheck(
    username,
    false,
    false,
    value => {
      if (!value) return _("register.empty_username");
      if (!isValidUsername(value)) return _("register.invalid_username");
      return true;
    },
    async value => {
      const { requestError, response } = await AuthApi.checkAvailability({ username: value });

      if (requestError) {
        message.error(requestError);
        return "";
      }

      if (!response.usernameAvailable) return _("register.username_already_taken");
      return true;
    }
  );

  // emailCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkEmail, waitForEmailCheck, getEmailUIValidateStatus, getEmailUIHelp] = useFieldCheck(
    email,
    false,
    false,
    value => {
      if (!value) return _("register.empty_email");
      if (!isValidEmail(value)) return _("register.invalid_email");
      return true;
    },
    async value => {
      const { requestError, response } = await AuthApi.checkAvailability({ email: value });

      if (requestError) {
        message.error(requestError);
        return "";
      }

      if (!response.emailAvailable) return _("register.email_already_used");
      return true;
    }
  );

  // passwordCheckStatus: false (not checked) | true (pass) | string (error message)
  const [
    checkPassword,
    waitForPasswordCheck,
    getPasswordUIValidateStatus,
    getPasswordUIHelp,
    getCurrentPassword
  ] = useFieldCheck(password, false, 100, value => {
    if (!value) return _("register.empty_password");
    if (!isValidPassword(value)) return _("register.invalid_password");
    return true;
  });

  const [
    checkRetypePassword,
    waitForRetypePasswordCheck,
    getRetypePasswordUIValidateStatus,
    getRetypePasswordUIHelp
  ] = useFieldCheck(retypePassword, true, 100, value => {
    if (value !== getCurrentPassword()) return _("register.passwords_do_not_match");
    if (!value) return "";
    return true;
  });

  async function onSubmit() {
    if (registerPending) return;
    setRegisterPending(true);

    if (!(await waitForUsernameCheck())) {
      message.error(_("register.username_unavailable_message"));
      refUsername.current.input.focus();
      refUsername.current.input.select();
    } else if (!(await waitForEmailCheck())) {
      message.error(_("register.email_unavailable_message"));
      refEmail.current.input.focus();
      refEmail.current.input.select();
    } else if (!(await waitForPasswordCheck())) {
      message.error(_("register.invalid_password_message"));
      refPassword.current.input.focus();
      refPassword.current.input.select();
    } else if (!(await waitForRetypePasswordCheck())) {
      message.error(_("register.passwords_do_not_match_message"));
      refRetypePassword.current.input.focus();
      refRetypePassword.current.input.select();
    } else {
      const { requestError, response } = await AuthApi.register({
        username: username,
        email: email,
        password: password
      });

      if (requestError) message.error(requestError);
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            message.error(_("register.response_already_loggedin"));
            break;
          case "DUPLICATE_USERNAME":
            message.error(_("register.response_duplicate_username"));
            await waitForUsernameCheck(true);
            refUsername.current.input.focus();
            refUsername.current.input.select();
            break;
          case "DUPLICATE_EMAIL":
            message.error(_("register.response_duplicate_email"));
            await waitForEmailCheck(true);
            refEmail.current.input.focus();
            refEmail.current.input.select();
            break;
        }
      } else {
        // Register success
        message.success(_("register.success", { username }));
        appState.loggedInUser = response.userMeta;
        appState.token = response.token;

        setTimeout(() => {
          redirect();
        }, 1000);

        return;
      }
    }

    setRegisterPending(false);
  }

  // async function onSendEmailVerifyCode() {
  //   if (sendPending) return;
  //   setSendPending(true);

  //   if (!await waitForEmailCheck())
  //     message.error(_("register.email_unavailable_message"));
  //   else {
  //     console.log("send");
  //   }

  //   setSendPending(false);
  // }

  return (
    <Form className={style.wrapper}>
      <LoginLogo className={style.logo} />
      <div className={style.row}>
        <Form.Item hasFeedback validateStatus={getUsernameUIValidateStatus()} help={getUsernameUIHelp()}>
          <Input
            size="large"
            prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder={_("register.username")}
            autoComplete="username"
            value={username}
            onBlur={e => checkUsername()}
            onChange={e => setUsername(e.target.value)}
            onPressEnter={() => {
              refEmail.current.input.focus();
              refEmail.current.input.select();
            }}
            ref={refUsername}
          />
        </Form.Item>
      </div>

      <div className={style.row}>
        <Form.Item hasFeedback validateStatus={getEmailUIValidateStatus()} help={getEmailUIHelp()}>
          <Input
            size="large"
            prefix={<Icon type="mail" style={{ color: "rgba(0,0,0,.25)" }} />}
            placeholder={_("register.email")}
            autoComplete="email"
            value={email}
            onBlur={e => checkEmail()}
            onChange={e => setEmail(e.target.value)}
            onPressEnter={() => {
              refPassword.current.input.focus();
              refPassword.current.input.select();
            }}
            ref={refEmail}
          />
        </Form.Item>
      </div>

      {/* <div className={style.row}>
        <Form.Item
          hasFeedback
          className={style.inlineField}
        >
          <Form.Item
            hasFeedback
            style={{ width: "calc(75% - 7px)" }}
          >
            <Input
              size="large"
              prefix={<Icon type="safety" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder={_("register.email_verify_code")}
              value={emailVerifyCode}
              onChange={e => setEmailVerifyCode(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            style={{ width: "calc(25% - 7px)", float: "right" }}
          >
            <Button
              size="large"
              className={style.sendEmailVerifyCode}
              type="primary"
              ghost
              block
              loading={sendPending}
              onClick={onSendEmailVerifyCode}
            >
              <FormattedMessage id="register.send_email_verify_code" />
            </Button>
          </Form.Item>
        </Form.Item>
      </div> */}

      <div className={style.row}>
        <Form.Item hasFeedback className={style.inlineField}>
          <Form.Item
            style={{ width: "calc(50% - 7px)" }}
            hasFeedback
            validateStatus={getPasswordUIValidateStatus()}
            help={getPasswordUIHelp()}
          >
            <Input
              size="large"
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder={_("register.password")}
              autoComplete="new-password"
              value={password}
              onBlur={e => (checkPassword(), checkRetypePassword())}
              onChange={e => (setPassword(e.target.value), checkPassword(), checkRetypePassword())}
              onPressEnter={() => {
                refRetypePassword.current.input.focus();
                refRetypePassword.current.input.select();
              }}
              ref={refPassword}
            />
          </Form.Item>
          <Form.Item
            style={{ width: "calc(50% - 7px)", float: "right" }}
            hasFeedback
            validateStatus={getRetypePasswordUIValidateStatus()}
            help={!getPasswordUIHelp() && getRetypePasswordUIHelp()}
          >
            <Input
              size="large"
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder={_("register.retype_password")}
              autoComplete="new-password"
              value={retypePassword}
              onBlur={e => checkRetypePassword()}
              onChange={e => (setRetypePassword(e.target.value), checkPassword(), checkRetypePassword())}
              onPressEnter={onSubmit}
              ref={refRetypePassword}
            />
          </Form.Item>
        </Form.Item>
      </div>

      <div className={style.buttonRow}>
        <Button size="large" type="primary" block loading={registerPending} onClick={onSubmit}>
          <FormattedMessage id="register.register" />
        </Button>
      </div>
    </Form>
  );
};

export default RegisterPage;

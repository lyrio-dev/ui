import React, { useEffect, useState, useRef } from "react";
import { Header, Segment, Message, Input, Button, Form, Icon, Ref } from "semantic-ui-react";
import { route } from "navi";
import { useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "../common.module.less";

import { appState } from "@/appState";

import api from "@/api";
import {
  useLocalizer,
  useFieldCheck,
  useLoginOrRegisterNavigation,
  useRecaptcha,
  useNavigationChecked
} from "@/utils/hooks";
import toast from "@/utils/toast";
import {
  isValidUsername,
  isValidEmail,
  isValidPassword,
  stripInvalidCharactersInEmailVerificationCode
} from "@/utils/validators";
import { refreshSession } from "@/initApp";
import PseudoLink from "@/components/PseudoLink";
import { onEnterPress } from "@/utils/onEnterPress";

let RegisterPage: React.FC = () => {
  const _ = useLocalizer("register");
  const currentRoute = useCurrentRoute();

  const navigation = useNavigationChecked();
  const redirect = () => {
    navigation.navigate(currentRoute.url.query.loginRedirectUrl || "/");
  };

  const navigateTo = useLoginOrRegisterNavigation();

  useEffect(() => {
    if (appState.currentUser) redirect();
  }, []);

  useEffect(() => {
    appState.enterNewPage(_(".title"));
  }, [appState.locale]);

  const recaptcha = useRecaptcha();

  const [successMessage, setSuccessMessage] = useState<string>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [registerPending, setRegisterPending] = useState(false);

  const refUsernameInput = useRef<HTMLInputElement>();
  const refEmailInput = useRef<HTMLInputElement>();
  const refEmailVerificationCodeInput = useRef<HTMLInputElement>();
  const refPasswordInput = useRef<HTMLInputElement>();
  const refRetypePasswordInput = useRef<HTMLInputElement>();

  const refForm = useRef(null);

  // usernameCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkUsername, waitForUsernameCheck, getUsernameUIValidateStatus, getUsernameUIHelp] = useFieldCheck(
    username,
    false,
    false,
    value => {
      if (!value) return _(".empty_username");
      if (!isValidUsername(value)) return _(".invalid_username");
      return true;
    },
    async value => {
      const { requestError, response } = await api.auth.checkAvailability({ username: value });

      if (requestError) {
        toast.error(requestError(_));
        return "";
      }

      if (!response.usernameAvailable) return _(".username_already_taken");
      return true;
    }
  );

  // emailCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkEmail, waitForEmailCheck, getEmailUIValidateStatus, getEmailUIHelp] = useFieldCheck(
    email,
    false,
    false,
    value => {
      if (!value) return _(".empty_email");
      if (!isValidEmail(value)) return _(".invalid_email");
      return true;
    },
    async value => {
      const { requestError, response } = await api.auth.checkAvailability({ email: value });

      if (requestError) {
        toast.error(requestError(_));
        return "";
      }

      if (!response.emailAvailable) return _(".email_already_used");
      return true;
    }
  );

  // passwordCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkPassword, waitForPasswordCheck, getPasswordUIValidateStatus, getPasswordUIHelp, getCurrentPassword] =
    useFieldCheck(password, false, false, value => {
      if (!value) return _(".empty_password");
      if (!isValidPassword(value)) return _(".invalid_password");
      return true;
    });

  const [checkRetypePassword, waitForRetypePasswordCheck, getRetypePasswordUIValidateStatus, getRetypePasswordUIHelp] =
    useFieldCheck(retypePassword, true, false, value => {
      if (value !== getCurrentPassword()) return _(".passwords_do_not_match");
      if (!value) return _(".empty_password");
      return true;
    });

  const [emailVerificationCodeError, setEmailVerificationCodeError] = useState(false);

  async function onSubmit() {
    if (registerPending) return;
    setRegisterPending(true);

    if (!(await waitForUsernameCheck())) {
      toast.error(_(".username_unavailable_message"));
      refUsernameInput.current.focus();
      refUsernameInput.current.select();
    } else if (!(await waitForEmailCheck())) {
      toast.error(_(".email_unavailable_message"));
      refEmailInput.current.focus();
      refEmailInput.current.select();
    } else if (!(await waitForPasswordCheck())) {
      toast.error(_(".invalid_password_message"));
      refPasswordInput.current.focus();
      refPasswordInput.current.select();
    } else if (!(await waitForRetypePasswordCheck())) {
      toast.error(_(".passwords_do_not_match_message"));
      refRetypePasswordInput.current.focus();
      refRetypePasswordInput.current.select();
    } else {
      const { requestError, response } = await api.auth.register(
        {
          username: username,
          email: email,
          emailVerificationCode: emailVerificationCode,
          password: password
        },
        recaptcha("Register")
      );

      if (requestError) toast.error(requestError(_));
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            toast.error(_(`.errors.${response.error}`));
            break;
          case "DUPLICATE_USERNAME":
            toast.error(_(`.errors.${response.error}`));
            await waitForUsernameCheck(true);
            refUsernameInput.current.focus();
            refUsernameInput.current.select();
            break;
          case "DUPLICATE_EMAIL":
            toast.error(_(`.errors.${response.error}`));
            await waitForEmailCheck(true);
            refEmailInput.current.focus();
            refEmailInput.current.select();
            break;
          case "INVALID_EMAIL_VERIFICATION_CODE":
            toast.error(_(`.errors.${response.error}`));
            setEmailVerificationCodeError(true);
            refEmailVerificationCodeInput.current.focus();
            break;
        }
      } else {
        // Register success
        appState.token = response.token;

        {
          setSuccessMessage(_(".success", { username }));

          setTimeout(async () => {
            await refreshSession();
            redirect();
          }, 1000);
        }

        return;
      }
    }

    setRegisterPending(false);
  }

  const [sendEmailVerificationCodeTimeout, setSendEmailVerificationCodeTimeout] = useState(0);
  const [sendEmailVerificationCodePending, setSendEmailVerificationCodePending] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setSendEmailVerificationCodeTimeout(timeout => timeout && timeout - 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  async function onSendEmailVerificationCode() {
    if (sendEmailVerificationCodePending) return;
    setSendEmailVerificationCodePending(true);

    if (!(await waitForEmailCheck())) {
      toast.error(_(".email_unavailable_message"));
      refEmailInput.current.focus();
      refEmailInput.current.select();
    } else {
      const { requestError, response } = await api.auth.sendEmailVerificationCode(
        {
          email: email,
          type: "Register",
          locale: appState.locale
        },
        recaptcha("SendEmailVerifactionCode_Register")
      );
      if (requestError) toast.error(requestError(_));
      else if (response.error) toast.error(_(`.errors.${response.error}`, { errorMessage: response.errorMessage }));
      else {
        toast.success(_(".email_verification_code_sent"));
        setSendEmailVerificationCodeTimeout(61);
      }
    }

    setSendEmailVerificationCodePending(false);
  }

  function onChangeVerificationCode(code: string) {
    setEmailVerificationCodeError(false);
    setEmailVerificationCode(stripInvalidCharactersInEmailVerificationCode(code));
  }

  const logo = appState.appLogoThemed && <img className={style.logo} {...appState.appLogoThemed} />;

  return (
    <>
      <div className={style.wrapper}>
        <Header as="h2" className={style.header + (logo ? " " + style.withLogo : "")} textAlign="center">
          {logo}
          {_(".register_new_account")}
        </Header>
        <Form size="large" ref={refForm}>
          <Segment>
            {/* username */}
            <Ref innerRef={field => field && (refUsernameInput.current = field.querySelector("input"))}>
              <Form.Field
                control={Input}
                error={
                  getUsernameUIValidateStatus() === "error" && {
                    content: getUsernameUIHelp(),
                    pointing: "left"
                  }
                }
                loading={getUsernameUIValidateStatus() === "validating"}
                fluid
                icon="user"
                iconPosition="left"
                placeholder={_(".username")}
                value={username}
                autoComplete="username"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                onBlur={() => checkUsername()}
                onKeyPress={onEnterPress(() => refEmailInput.current.focus())}
              />
            </Ref>

            {/* email */}
            <Ref innerRef={field => field && (refEmailInput.current = field.querySelector("input"))}>
              <Form.Field
                control={Input}
                error={
                  getEmailUIValidateStatus() === "error" && {
                    content: getEmailUIHelp(),
                    pointing: "left"
                  }
                }
                loading={getEmailUIValidateStatus() === "validating"}
                fluid
                icon="envelope"
                iconPosition="left"
                placeholder={_(".email")}
                value={email}
                autoComplete="email"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onBlur={() => checkEmail()}
                onKeyPress={onEnterPress(() => {
                  if (appState.serverPreference.security.requireEmailVerification) {
                    refEmailVerificationCodeInput.current.focus();
                    if (sendEmailVerificationCodeTimeout === 0) onSendEmailVerificationCode();
                  } else refPasswordInput.current.focus();
                })}
              />
            </Ref>

            {
              /* email verification code */
              appState.serverPreference.security.requireEmailVerification && (
                <Ref
                  innerRef={field => field && (refEmailVerificationCodeInput.current = field.querySelector("input"))}
                >
                  <Form.Field
                    control={Input}
                    error={
                      emailVerificationCodeError && {
                        content: _(".invalid_email_verification_code"),
                        pointing: "left"
                      }
                    }
                    fluid
                    icon="shield"
                    iconPosition="left"
                    placeholder={_(".email_verification_code")}
                    value={emailVerificationCode}
                    autoComplete="off"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeVerificationCode(e.target.value)}
                    onKeyPress={onEnterPress(() => refPasswordInput.current.focus())}
                    action={
                      <Button
                        tabIndex={-1}
                        disabled={sendEmailVerificationCodeTimeout !== 0}
                        loading={sendEmailVerificationCodePending}
                        content={
                          sendEmailVerificationCodeTimeout
                            ? `${sendEmailVerificationCodeTimeout > 60 ? 60 : sendEmailVerificationCodeTimeout}s`
                            : _(".send_email_verification_code")
                        }
                        onClick={onSendEmailVerificationCode}
                      />
                    }
                  />
                </Ref>
              )
            }

            {/* password */}
            <Ref innerRef={field => field && (refPasswordInput.current = field.querySelector("input"))}>
              <Form.Field
                control={Input}
                error={
                  getPasswordUIValidateStatus() === "error" && {
                    content: getPasswordUIHelp(),
                    pointing: "left"
                  }
                }
                loading={getPasswordUIValidateStatus() === "validating"}
                fluid
                icon="lock"
                iconPosition="left"
                placeholder={_(".password")}
                value={password}
                type="password"
                autoComplete="new-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onBlur={() => checkPassword()}
                onKeyPress={onEnterPress(() => refRetypePasswordInput.current.focus())}
              />
            </Ref>
            <Ref innerRef={field => field && (refRetypePasswordInput.current = field.querySelector("input"))}>
              <Form.Field
                control={Input}
                error={
                  getRetypePasswordUIValidateStatus() === "error" && {
                    content: getRetypePasswordUIHelp(),
                    pointing: "left"
                  }
                }
                loading={getRetypePasswordUIValidateStatus() === "validating"}
                fluid
                icon="lock"
                iconPosition="left"
                placeholder={_(".retype_password")}
                value={retypePassword}
                type="password"
                autoComplete="new-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetypePassword(e.target.value)}
                onBlur={() => checkRetypePassword()}
                onKeyPress={onEnterPress(() => {
                  checkRetypePassword(); // Since the focus is not lost, forcibly re-check the field
                  onSubmit();
                })}
              />
            </Ref>

            {recaptcha.getCopyrightMessage(style.recaptchaCopyright)}

            <Button
              className={successMessage && style.successButton}
              primary={!successMessage}
              color={successMessage ? "green" : null}
              fluid
              size="large"
              loading={registerPending && !successMessage}
              onClick={() => onSubmit()}
            >
              {successMessage ? (
                <>
                  <Icon name="checkmark" />
                  {successMessage}
                </>
              ) : (
                _(".register")
              )}
            </Button>
          </Segment>
        </Form>
        <Message className={style.message}>
          {_(".already_have_account")}
          <PseudoLink onClick={() => navigateTo("login")}>{_(".login")}</PseudoLink>
        </Message>
      </div>
    </>
  );
};

RegisterPage = observer(RegisterPage);

export default route({
  view: <RegisterPage />
});

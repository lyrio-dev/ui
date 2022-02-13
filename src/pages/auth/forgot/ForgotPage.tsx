import React, { useEffect, useState, useRef } from "react";
import { Header, Segment, Input, Button, Form, Icon, Ref } from "semantic-ui-react";
import { route } from "navi";
import { useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "../common.module.less";

import { appState } from "@/appState";

import api from "@/api";
import { useLocalizer, useFieldCheck, useRecaptcha, useNavigationChecked } from "@/utils/hooks";
import toast from "@/utils/toast";
import { isValidEmail, isValidPassword, stripInvalidCharactersInEmailVerificationCode } from "@/utils/validators";
import { refreshSession } from "@/initApp";
import { onEnterPress } from "@/utils/onEnterPress";

let ForgetPage: React.FC = () => {
  const _ = useLocalizer("forgot");
  const currentRoute = useCurrentRoute();

  const navigation = useNavigationChecked();
  const redirect = () => {
    navigation.navigate(currentRoute.url.query.loginRedirectUrl || "/");
  };

  useEffect(() => {
    if (appState.currentUser) redirect();
  }, []);

  useEffect(() => {
    appState.enterNewPage(_(".title"));
  }, [appState.locale]);

  const recaptcha = useRecaptcha();

  const [successMessage, setSuccessMessage] = useState<string>(null);

  const [email, setEmail] = useState("");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [resetPasswordPending, setResetPasswordPending] = useState(false);

  const refEmailInput = useRef<HTMLInputElement>();
  const refEmailVerificationCodeInput = useRef<HTMLInputElement>();
  const refPasswordInput = useRef<HTMLInputElement>();
  const refRetypePasswordInput = useRef<HTMLInputElement>();

  const refForm = useRef(null);

  // emailCheckStatus: false (not checked) | true (pass) | string (error message)
  const [checkEmail, waitForEmailCheck, getEmailUIValidateStatus, getEmailUIHelp] = useFieldCheck(
    email,
    false,
    false,
    value => {
      if (!value) return _(".empty_email");
      if (!isValidEmail(value)) return _(".invalid_email");
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
      console.log("retype check: ", retypePassword, getCurrentPassword());
      if (value !== getCurrentPassword()) return _(".passwords_do_not_match");
      if (!value) return _(".empty_password");
      return true;
    });

  const [emailVerificationCodeError, setEmailVerificationCodeError] = useState(false);

  async function onSubmit() {
    if (resetPasswordPending) return;
    setResetPasswordPending(true);

    if (!(await waitForEmailCheck())) {
      toast.error(_(".email_invalid_message"));
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
      const { requestError, response } = await api.auth.resetPassword(
        {
          email: email,
          emailVerificationCode: emailVerificationCode,
          newPassword: password
        },
        recaptcha("ResetPassword")
      );

      if (requestError) toast.error(requestError(_));
      else if (response.error) {
        switch (response.error) {
          case "NO_SUCH_USER":
            toast.error(_(`.errors.${response.error}`));
            refEmailInput.current.focus();
            break;
          case "INVALID_EMAIL_VERIFICATION_CODE":
            toast.error(_(`.errors.${response.error}`));
            setEmailVerificationCodeError(true);
            refEmailVerificationCodeInput.current.focus();
            break;
        }
      } else {
        // Reset password success
        appState.token = response.token;

        {
          setSuccessMessage(_(".success"));

          setTimeout(async () => {
            await refreshSession();
            redirect();
          }, 1000);
        }

        return;
      }
    }

    setResetPasswordPending(false);
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
      toast.error(_(".email_invalid_message"));
      refEmailInput.current.focus();
      refEmailInput.current.select();
    } else {
      const { requestError, response } = await api.auth.sendEmailVerificationCode(
        {
          email: email,
          type: "ResetPassword",
          locale: appState.locale
        },
        recaptcha("SendEmailVerifactionCode_ResetPassword")
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
          {_(".reset_your_password")}
        </Header>
        <Form size="large" ref={refForm}>
          <Segment>
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
                  if (sendEmailVerificationCodeTimeout === 0) onSendEmailVerificationCode();
                  refEmailVerificationCodeInput.current.focus();
                })}
              />
            </Ref>

            {/* email verification code */}
            <Ref innerRef={field => field && (refEmailVerificationCodeInput.current = field.querySelector("input"))}>
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
              loading={resetPasswordPending && !successMessage}
              onClick={() => onSubmit()}
            >
              {successMessage ? (
                <>
                  <Icon name="checkmark" />
                  {successMessage}
                </>
              ) : (
                _(".submit")
              )}
            </Button>
          </Segment>
        </Form>
      </div>
    </>
  );
};

ForgetPage = observer(ForgetPage);

export default route({
  view: <ForgetPage />
});

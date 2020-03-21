import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Grid, Header, Segment, Message, Image, Input, Button, Form, Icon } from "semantic-ui-react";
import { route } from "navi";
import { Link } from "react-navi";
import { useNavigation, useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "./RegisterPage.module.less";
import AppLogo from "@/assets/syzoj-applogo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage, useFieldCheck } from "@/utils/hooks";
import toast from "@/utils/toast";
import { isValidUsername, isValidEmail, isValidPassword } from "@/utils/validators";

let RegisterPage: React.FC = () => {
  const _ = useIntlMessage();
  const currentRoute = useCurrentRoute();

  const navigation = useNavigation();
  const redirect = () => {
    navigation.navigate(currentRoute.url.query.loginRedirectUrl || "/");
  };

  useEffect(() => {
    if (appState.loggedInUser) redirect();
  }, []);

  useEffect(() => {
    appState.enterNewPage(_("register.title"));
  }, [appState.locale]);

  const [successMessage, setSuccessMessage] = useState<string>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [registerPending, setRegisterPending] = useState(false);

  const refForm = useRef(null);

  // Ugly workaround
  function getInput(name: string): HTMLInputElement {
    const query = (x: string) => (ReactDOM.findDOMNode(refForm.current) as any).querySelector(x);
    if (name === "username") return query("[autocomplete=username]");
    else if (name === "email") return query("[autocomplete=email]");
    else if (name === "password") return query("[autocomplete=new-password]");
    else if (name === "retype-password") return query(".field:last-of-type input[autocomplete=new-password]");
  }

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
        toast.error(requestError);
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
        toast.error(requestError);
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
    if (!value) return _("register.empty_password");
    return true;
  });

  async function onSubmit() {
    if (registerPending) return;
    setRegisterPending(true);

    if (!(await waitForUsernameCheck())) {
      toast.error(_("register.username_unavailable_message"));
      getInput("username").focus();
      getInput("username").select();
    } else if (!(await waitForEmailCheck())) {
      toast.error(_("register.email_unavailable_message"));
      getInput("email").focus();
      getInput("email").select();
    } else if (!(await waitForPasswordCheck())) {
      toast.error(_("register.invalid_password_message"));
      getInput("password").focus();
      getInput("password").select();
    } else if (!(await waitForRetypePasswordCheck())) {
      toast.error(_("register.passwords_do_not_match_message"));
      getInput("retype-password").focus();
      getInput("retype-password").select();
    } else {
      const { requestError, response } = await AuthApi.register({
        username: username,
        email: email,
        password: password
      });

      if (requestError) toast.error(requestError);
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            toast.error(_("register.response_already_loggedin"));
            break;
          case "DUPLICATE_USERNAME":
            toast.error(_("register.response_duplicate_username"));
            await waitForUsernameCheck(true);
            getInput("username").focus();
            getInput("username").select();
            break;
          case "DUPLICATE_EMAIL":
            toast.error(_("register.response_duplicate_email"));
            await waitForEmailCheck(true);
            getInput("email").focus();
            getInput("email").select();
            break;
        }
      } else {
        // Register success
        setSuccessMessage(_("register.success", { username }));

        {
          const { requestError, response } = await AuthApi.getCurrentUserAndPreference();
          if (requestError) toast.error(requestError);
          else if (!response.userMeta) location.reload();

          setTimeout(() => {
            appState.loggedInUser = response.userMeta;
            appState.userPreference = response.userPreference;
            appState.serverPreference = response.serverPreference;

            redirect();
          }, 1000);
        }

        return;
      }
    }

    setRegisterPending(false);
  }

  return (
    <>
      <div className={style.wrapper}>
        <Header as="h2" className={style.header} textAlign="center">
          <Image as={AppLogo} className={style.logo} />
          {_("register.register_new_account")}
        </Header>
        <Form size="large" ref={refForm}>
          <Segment>
            {/* username */}
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
              placeholder={_("register.username")}
              value={username}
              autoComplete="username"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              onBlur={() => checkUsername()}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  getInput("email").focus();
                }
              }}
            />

            {/* email */}
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
              placeholder={_("register.email")}
              value={email}
              autoComplete="email"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              onBlur={() => checkEmail()}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.keyCode === 13) {
                  e.preventDefault();
                  getInput("password").focus();
                }
              }}
            />

            {/* password */}
            <Form.Group className={style.passwords} widths="equal">
              <Form.Field
                control={Input}
                error={
                  getPasswordUIValidateStatus() === "error" && {
                    content: getPasswordUIHelp(),
                    pointing: "right"
                  }
                }
                loading={getPasswordUIValidateStatus() === "validating"}
                fluid
                icon="lock"
                iconPosition="left"
                placeholder={_("register.password")}
                value={password}
                type="password"
                autoComplete="new-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                onBlur={() => checkPassword()}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.keyCode === 13) {
                    e.preventDefault();
                    getInput("retype-password").focus();
                  }
                }}
              />
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
                placeholder={_("register.retype_password")}
                value={retypePassword}
                type="password"
                autoComplete="new-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRetypePassword(e.target.value)}
                onBlur={() => checkRetypePassword()}
              />
            </Form.Group>

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
                _("register.register")
              )}
            </Button>
          </Segment>
        </Form>
        <Message className={style.message} textAlign="center">
          {_("register.already_have_account")}
          <Link href="/login">{_("register.login")}</Link>
        </Message>
      </div>
    </>
  );
};

RegisterPage = observer(RegisterPage);

export default route({
  view: <RegisterPage />
});

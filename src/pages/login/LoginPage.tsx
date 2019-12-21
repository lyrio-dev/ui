import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import { Grid, Header, Segment, Message, Image, Input, Button, Form, Icon } from "semantic-ui-react";
import { route } from "navi";
import { Link } from "react-navi";
import { useNavigation, useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "./LoginPage.module.less";
import AppLogo from "@/assets/syzoj-applogo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage } from "@/utils/hooks";
import { isValidUsername, isValidPassword } from "@/utils/validators";
import toast from "@/utils/toast";

let LoginPage: React.FC = () => {
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
    appState.title = _("login.title");
  }, [appState.locale]);

  const [formError, setFormError] = useState({ type: null, message: null });
  const setError = (type: "username" | "password", message: string) => setFormError({ type, message });

  const [successMessage, setSuccessMessage] = useState<string>(null);
  const setSuccess = (message: string) => {
    setError(null, null);
    setSuccessMessage(message);
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  const refForm = useRef(null);

  // Ugly workaround
  function getInput(name: string): HTMLInputElement {
    const query = (x: string) => (ReactDOM.findDOMNode(refForm.current) as any).querySelector(x);
    if (name === "username") return query("[autocomplete='username']");
    else if (name === "password") return query("[autocomplete='current-password']");
  }

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

      if (requestError) toast.error(requestError);
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            toast.error(_("login.already_loggedin"));
            break;
          case "NO_SUCH_USER":
            setError("username", _("login.no_such_user"));
            getInput("username").focus();
            getInput("username").select();
            break;
          case "WRONG_PASSWORD":
            setError("password", _("login.wrong_password"));
            getInput("password").focus();
            getInput("password").select();
            break;
        }
      } else {
        // Login success
        setSuccess(_("login.welcome", { username }));

        setTimeout(() => {
          appState.loggedInUser = response.userMeta;
          appState.token = response.token;

          redirect();
        }, 1000);

        return;
      }
    }

    setPending(false);
  }

  return (
    <>
      <Grid textAlign="center">
        <Grid.Column className={style.wrapper}>
          <Header as="h2" className={style.header} textAlign="center">
            <Image as={AppLogo} className={style.logo} />
            {_("login.login_to_your_account")}
          </Header>
          <Form size="large" ref={refForm}>
            <Segment>
              <Form.Field
                control={Input}
                error={
                  formError.type === "username" && {
                    content: formError.message,
                    pointing: "left"
                  }
                }
                fluid
                icon="user"
                iconPosition="left"
                placeholder={_("login.username")}
                value={username}
                autoComplete="username"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.keyCode === 13) {
                    e.preventDefault();
                    getInput("password").focus();
                  }
                }}
              />
              <Form.Field
                control={Input}
                error={
                  formError.type === "password" && {
                    content: formError.message,
                    pointing: "left"
                  }
                }
                fluid
                icon="lock"
                iconPosition="left"
                placeholder={_("login.password")}
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />

              <Button
                className={successMessage && style.successButton}
                primary={!successMessage}
                color={successMessage ? "green" : null}
                fluid
                size="large"
                loading={pending && !successMessage}
                onClick={() => onSubmit()}
              >
                {successMessage ? (
                  <>
                    <Icon name="checkmark" />
                    {successMessage}
                  </>
                ) : (
                  _("login.login")
                )}
              </Button>
            </Segment>
          </Form>
          <Message className={style.message}>
            {_("login.new_user")}
            <Link href="/register">{_("login.register")}</Link>
          </Message>
        </Grid.Column>
      </Grid>
    </>
  );
};

LoginPage = observer(LoginPage);

export default route({
  view: <LoginPage />
});

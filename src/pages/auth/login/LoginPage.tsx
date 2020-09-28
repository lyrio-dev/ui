import React, { useEffect, useState, useRef } from "react";
import { Header, Segment, Message, Image, Input, Button, Form, Icon, Ref } from "semantic-ui-react";
import { route } from "navi";
import { useNavigation, useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "../common.module.less";
import AppLogo from "@/assets/syzoj-applogo.svg";

import { appState } from "@/appState";

import { AuthApi } from "@/api";
import { useIntlMessage, useLoginOrRegisterNavigation } from "@/utils/hooks";
import { isValidUsername, isValidPassword } from "@/utils/validators";
import toast from "@/utils/toast";
import { refreshSession } from "@/initApp";
import PseudoLink from "@/components/PseudoLink";
import { onEnterPress } from "@/utils/onEnterPress";

let LoginPage: React.FC = () => {
  const _ = useIntlMessage("login");
  const currentRoute = useCurrentRoute();

  const navigation = useNavigation();
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

  const refUsernameInput = useRef<HTMLInputElement>();
  const refPasswordInput = useRef<HTMLInputElement>();

  async function onSubmit() {
    if (pending) return;
    setPending(true);

    if (username.length === 0) {
      setError("username", _(".empty_username"));
    } else if (!isValidUsername(username)) {
      setError("username", _(".invalid_username"));
    } else if (password.length === 0) {
      setError("password", _(".empty_password"));
    } else if (!isValidPassword(password)) {
      setError("password", _(".invalid_password"));
    } else {
      // Send login request
      const { requestError, response } = await AuthApi.login({ username, password });

      if (requestError) toast.error(requestError);
      else if (response.error) {
        switch (response.error) {
          case "ALREADY_LOGGEDIN":
            toast.error(_(".already_loggedin"));
            break;
          case "NO_SUCH_USER":
            setError("username", _(".no_such_user"));
            refUsernameInput.current.focus();
            refUsernameInput.current.select();
            break;
          case "WRONG_PASSWORD":
            setError("password", _(".wrong_password"));
            refPasswordInput.current.focus();
            refPasswordInput.current.select();
            break;
        }
      } else {
        // Login success
        appState.token = response.token;

        {
          setSuccess(_(".welcome", { username: username }));

          setTimeout(async () => {
            await refreshSession();
            redirect();
          }, 1000);
        }

        return;
      }
    }

    setPending(false);
  }

  return (
    <>
      <div className={style.wrapper}>
        <Header as="h2" className={style.header} textAlign="center">
          <Image as={AppLogo} className={style.logo} />
          {_(".login_to_your_account")}
        </Header>
        <Form size="large">
          <Segment>
            <Ref innerRef={field => field && (refUsernameInput.current = field.querySelector("input"))}>
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
                placeholder={_(".username")}
                value={username}
                autoComplete="username"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                onKeyPress={onEnterPress(() => refPasswordInput.current.focus())}
              />
            </Ref>
            <PseudoLink onClick={() => navigateTo("forgot")} tabIndex={-1} className={style.inputAction}>
              {_(".forgot_password")}
            </PseudoLink>
            <Ref innerRef={field => field && (refPasswordInput.current = field.querySelector("input"))}>
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
                placeholder={_(".password")}
                value={password}
                type="password"
                autoComplete="current-password"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </Ref>

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
                _(".login")
              )}
            </Button>
          </Segment>
        </Form>
        <Message className={style.message}>
          {_(".new_user")}
          <PseudoLink onClick={() => navigateTo("register")}>{_(".register")}</PseudoLink>
        </Message>
      </div>
    </>
  );
};

LoginPage = observer(LoginPage);

export default route({
  view: <LoginPage />
});

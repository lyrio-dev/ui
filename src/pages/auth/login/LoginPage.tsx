import React, { useEffect, useState, useRef } from "react";
import { Header, Segment, Message, Image, Input, Button, Form, Icon, Ref } from "semantic-ui-react";
import { route } from "navi";
import { useCurrentRoute } from "react-navi";
import { observer } from "mobx-react";

import style from "../common.module.less";

import { appState } from "@/appState";

import api from "@/api";
import {
  useAsyncCallbackPending,
  useDialog,
  useLocalizer,
  useLoginOrRegisterNavigation,
  useRecaptcha,
  useNavigationChecked
} from "@/utils/hooks";
import { isValidUsername } from "@/utils/validators";
import toast from "@/utils/toast";
import { refreshSession } from "@/initApp";
import PseudoLink from "@/components/PseudoLink";
import { onEnterPress } from "@/utils/onEnterPress";

let LoginPage: React.FC = () => {
  const _ = useLocalizer("login");
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

  // These states are only for migration with dialog
  const [migrationNewUsername, setMigrationNewUsername] = useState("");
  const refNewUsername = useRef<string>();
  const [migrationPending, doDialogMigration] = useAsyncCallbackPending(async () => {
    if (!isValidUsername(migrationNewUsername)) {
      toast.error(_(".migration.invalid_username"));
      return;
    }

    const { requestError, response } = await api.migration.migrateUser({
      oldUsername: username,
      oldPassword: password,
      newUsername: migrationNewUsername,
      newPassword: password
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) handleCommonError(response.error);
    else {
      refNewUsername.current = migrationNewUsername;
      setUsername(migrationNewUsername);
      refOnMigrationDialogFinish.current(response.token);
    }
  });

  const migrationDialog = useDialog(
    {
      size: "small"
    },
    <Header icon="key" content={_(".migration.title")} />,
    <>
      <p>{_(".migration.message")}</p>
      <p dangerouslySetInnerHTML={{ __html: _(".migration.message_username") }} />
      <Input
        icon="user"
        iconPosition="left"
        placeholder={_(".migration.placeholder")}
        value={migrationNewUsername}
        readOnly={migrationPending}
        onChange={(e, { value }) => setMigrationNewUsername(value)}
      />
    </>,
    () => (
      <>
        <Button
          disabled={migrationPending}
          content={_(".migration.cancel")}
          onClick={() => {
            setMigrationNewUsername("");
            refOnMigrationDialogFinish.current();
          }}
        />
        <Button
          primary
          loading={migrationPending}
          content={_(".migration.confirm")}
          onClick={() => doDialogMigration()}
        />
      </>
    )
  );

  function handleCommonError(error: string) {
    switch (error) {
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
      default:
        toast.error(_(`.errors.${error}`));
    }
  }

  let refOnMigrationDialogFinish = useRef<(token?: string) => void>();
  async function promptAndMigrate() {
    migrationDialog.open();
    const result = await new Promise<string>(resolve => (refOnMigrationDialogFinish.current = resolve));
    migrationDialog.close();
    return result;
  }

  async function tryMigrate() {
    const { requestError, response } = await api.migration.queryUserMigrationInfo({
      oldUsername: username
    });

    if (requestError) toast.error(requestError(_));
    else if (response.error) handleCommonError(response.error);
    else {
      if (response.migrated) {
        toast.error(_(".system_error"));
        return;
      }

      if (response.usernameMustChange) {
        return await promptAndMigrate();
      }

      {
        const { requestError, response } = await api.migration.migrateUser({
          oldUsername: username,
          oldPassword: password,
          newUsername: username,
          newPassword: password
        });

        if (requestError) toast.error(requestError(_));
        else if (response.error) handleCommonError(response.error);
        else return response.token;
      }
    }
  }

  async function onSubmit() {
    if (pending) return;
    setPending(true);

    if (username.length === 0) {
      setError("username", _(".empty_username"));
    } else if (username.length > 80) {
      // A SYZOJ 2 username is allowed to check if a user is not migrated.
      setError("username", _(".invalid_username"));
    } else if (password.length === 0) {
      setError("password", _(".empty_password"));
    } else {
      // Send login request
      const { requestError, response } = await api.auth.login({ username, password }, recaptcha("Login"));

      if (requestError) toast.error(requestError(_));
      else if (response.error && response.error !== "USER_NOT_MIGRATED") handleCommonError(response.error);
      else {
        setError(null, null);

        let token = "";
        if (!response.error) token = response.token;
        if (response.error === "USER_NOT_MIGRATED") token = await tryMigrate();

        if (token) {
          // Login success
          appState.token = token;

          {
            setSuccess(_(".welcome", { username: refNewUsername.current || username }));

            setTimeout(async () => {
              await refreshSession();
              redirect();
            }, 1000);
          }

          return;
        }
      }
    }

    setPending(false);
  }

  const logo = window.appLogoUrl && <img className={style.logo} src={window.appLogoUrl} />;

  return (
    <>
      {migrationDialog.element}
      <div className={style.wrapper}>
        <Header as="h2" className={style.header + (logo ? " " + style.withLogo : "")} textAlign="center">
          {logo}
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
                readOnly={pending}
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
                readOnly={pending}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              />
            </Ref>

            {recaptcha.getCopyrightMessage(style.recaptchaCopyright)}

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

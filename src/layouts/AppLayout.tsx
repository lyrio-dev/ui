import React from "react";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react";
import { Link, useNavigation, useLoadingRoute, useCurrentRoute } from "react-navi";
import { Menu, Button, Dropdown, Container, Icon, Segment } from "semantic-ui-react";

import "semantic-ui-css/semantic.min.css";
import "noty/lib/noty.css";
import "noty/lib/themes/semanticui.css";

import style from "./AppLayout.module.less";
import Logo from "@/assets/syzoj-applogo.svg";

import GlobalProgressBar from "@/components/GlobalProgressBar";

import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import { appConfig } from "@/appConfig";
import { useIntlMessage } from "@/utils/hooks";
import toast from "@/utils/toast";

import { AuthApi } from "@/api";

let AppLayout: React.FC = props => {
  const navigation = useNavigation();
  const loadingRoute = useLoadingRoute();
  const currentRoute = useCurrentRoute();
  const _ = useIntlMessage();

  async function onLogoutClick() {
    const { requestError, response } = await AuthApi.logout();
    if (requestError) {
      toast.error(requestError);
    } else {
      appState.token = appState.loggedInUser = null;
      navigation.refresh();
    }
  }

  function onLoginOrRegisterClick(loginOrRegister: string) {
    // Save the current url for redirecting back
    let loginRedirectUrl: string;
    if (currentRoute.url.pathname !== "/login" && currentRoute.url.pathname !== "/register") {
      loginRedirectUrl = currentRoute.url.pathname + currentRoute.url.search + currentRoute.url.hash;
    } else {
      loginRedirectUrl = currentRoute.url.query.loginRedirectUrl;
    }

    navigation.navigate({
      pathname: "/" + loginOrRegister,
      query: loginRedirectUrl && {
        loginRedirectUrl
      }
    });
  }

  const navButtons: Record<string, { icon: string; text: string; url: string }> = {
    home: {
      icon: "home",
      text: "common.navbar.home",
      url: "/"
    },
    problem_set: {
      icon: "book",
      text: "common.navbar.problem_set",
      url: "/problems"
    },
    contests: {
      icon: "calendar",
      text: "common.navbar.contests",
      url: "/contests"
    },
    submissions: {
      icon: "hourglass",
      text: "common.navbar.submissions",
      url: "/submissions"
    },
    members: {
      icon: "users",
      text: "common.navbar.members",
      url: "/members"
    },
    discussion: {
      icon: "comments",
      text: "common.navbar.discussion",
      url: "/discussion"
    },
    help: {
      icon: "help circle",
      text: "common.navbar.help",
      url: "/help"
    }
  };

  return (
    <>
      <GlobalProgressBar isAnimating={!!loadingRoute} />
      <Menu borderless fixed="top" className={style.menu}>
        <Container>
          <Menu.Item as={Link} href="/">
            <div className={style.logo}>
              <Logo />
            </div>
            <div className={style.siteName}>{appConfig.siteName}</div>
          </Menu.Item>
          {Object.keys(navButtons).map(name => (
            <Menu.Item key={name} as={Link} href={navButtons[name].url}>
              <Icon name={navButtons[name].icon as any} />
              <FormattedMessage id={navButtons[name].text} />
            </Menu.Item>
          ))}
          {appState.loggedInUser ? (
            <>
              <div className={style.userContainer}>
                <Dropdown text={appState.loggedInUser.username} simple item>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} href="/settings" icon="cog" text={_("common.header.user.settings")} />
                    <Dropdown.Item onClick={onLogoutClick} icon="power" text={_("common.header.user.logout")} />
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </>
          ) : (
            <>
              <Menu.Item className={style.userContainer}>
                <Button className={style.loginButton} onClick={() => onLoginOrRegisterClick("login")}>
                  <FormattedMessage id="common.header.user.login" />
                </Button>
                <Button primary onClick={() => onLoginOrRegisterClick("register")} type="primary">
                  <FormattedMessage id="common.header.user.register" />
                </Button>
              </Menu.Item>
            </>
          )}
        </Container>
      </Menu>
      <Container>{props.children}</Container>
      <Segment vertical className={style.footer}>
        <Container textAlign="center">
          <div>
            {appConfig.siteName} Powered by{" "}
            <a href="https://github.com/syzoj/syzoj" target="_blank">
              SYZOJ
            </a>
          </div>
          <div className={style.languageSwitchContainer}>
            <Dropdown icon="language">
              <Dropdown.Menu>
                {Object.keys(localeMeta).map((locale: Locale) => (
                  <Dropdown.Item
                    key={locale}
                    onClick={() => {
                      appState.locale = locale;
                      navigation.refresh();
                    }}
                    flag={localeMeta[locale].flag}
                    text={localeMeta[locale].name}
                    value={locale}
                    selected={locale === appState.locale}
                  />
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Container>
      </Segment>
    </>
  );
};

AppLayout = observer(AppLayout);

export default AppLayout;

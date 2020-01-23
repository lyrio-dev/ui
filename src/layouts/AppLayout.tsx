import React, { useState } from "react";
import { observer } from "mobx-react";
import { Link, useNavigation, useLoadingRoute, useCurrentRoute } from "react-navi";
import { Menu, Button, Dropdown, Container, Icon, Segment, Sidebar } from "semantic-ui-react";

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
import { SemanticICONS } from "semantic-ui-react/dist/commonjs/generic";

let AppLayout: React.FC = props => {
  const navigation = useNavigation();
  const loadingRoute = useLoadingRoute();
  const currentRoute = useCurrentRoute();
  const _ = useIntlMessage();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  navigation.subscribe(route => {
    if (route.type === "ready")
      setSidebarOpen(false);
  });

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

  const navButtons: Record<string, { icon: SemanticICONS; text: string; url: string }> = {
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

  const navMenuItems = (
    Object.keys(navButtons).map(name => (
      <Menu.Item key={name} as={Link} href={navButtons[name].url}>
        <Icon name={navButtons[name].icon} />
        {_(navButtons[name].text)}
      </Menu.Item>
    ))
  );

  const loginAndRegisterButtons = (
    <>
      <Button className={style.loginAndRegisterButton} onClick={() => onLoginOrRegisterClick("login")}>
        {_("common.header.user.login")}
      </Button>
      <Button className={style.loginAndRegisterButton} primary onClick={() => onLoginOrRegisterClick("register")} type="primary">
        {_("common.header.user.register")}
      </Button>
    </>
  );

  const userMenu = ContainerComponent => (
    <>
      <ContainerComponent.Menu className={style.userMenu}>
        <ContainerComponent.Item as={Link} href="/settings">
          <Icon name="cog" />
          {_("common.header.user.settings")}
        </ContainerComponent.Item>
        <ContainerComponent.Item onClick={onLogoutClick}>
          <Icon name="power" />
          {_("common.header.user.logout")}
        </ContainerComponent.Item>
      </ContainerComponent.Menu>
    </>
  );

  const logo = (
    <Menu.Item as={Link} href="/" className={style.logoItem}>
      <div className={style.logo}>
        <Logo />
      </div>
      <div className={style.siteName}>{appConfig.siteName}</div>
    </Menu.Item>
  );

  const footer = (
    <>
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

  const topBarItemsForWideScreen = (
    <>
      {navMenuItems}
      {appState.loggedInUser ? (
        <>
          <div className={style.userContainer}>
            <Dropdown text={appState.loggedInUser.username} simple item>{userMenu(Dropdown)}</Dropdown>
          </div>
        </>
      ) : (
        <Menu.Item className={style.userContainer}>{loginAndRegisterButtons}</Menu.Item>
      )}
    </>
  );

  const topBarItemsForNarrowScreen = (
    <Menu.Menu position="right">
      {
        appState.loggedInUser && (
          <div className={style.userContainer}>
            <Dropdown text={appState.loggedInUser.username} simple icon={false} item>{userMenu(Dropdown)}</Dropdown>
          </div>
        )
      }
      <Menu.Item icon="bars" onClick={() => setSidebarOpen(true)} />
    </Menu.Menu>
  );

  const wide = appState.windowWidth >= 1024;

  return (
    <>
      <GlobalProgressBar isAnimating={!!loadingRoute} />
      <Sidebar.Pushable as="div" className={style.sidebarPushable}>
        <Sidebar
          as={Menu}
          className={style.sidebarMenu}
          animation="push"
          direction="right"
          onHide={() => setSidebarOpen(false)}
          vertical
          visible={sidebarOpen}
        >
          <Menu.Item
            className={style.siteName}
            as={Link}
            href="/"
          >
            {appConfig.siteName}
          </Menu.Item>
          <Menu.Item>
            {
              appState.loggedInUser
              ? (
                <>
                  <Menu.Header>{appState.loggedInUser.username}</Menu.Header>
                  {userMenu(Menu)}
                </>
              )
              : (
                <Button.Group fluid>
                  {loginAndRegisterButtons}
                </Button.Group>
              )
            }
          </Menu.Item>
          {navMenuItems}
        </Sidebar>
        <Sidebar.Pusher dimmed={sidebarOpen} className={style.sidebarPusher}>
          <Menu
            borderless
            fixed="top"
            className={
              style.menu + " " + (wide ? style.wide : style.narrow)
            }
          >
            <Container>
            {logo}
              {
                wide
                ? topBarItemsForWideScreen
                : topBarItemsForNarrowScreen
              }
            </Container>
          </Menu>
          <div className={style.appContentContainer}>
            <Container>{props.children}</Container>
            {footer}
          </div>
        </Sidebar.Pusher>
      </Sidebar.Pushable>
    </>
  );
};

AppLayout = observer(AppLayout);

export default AppLayout;

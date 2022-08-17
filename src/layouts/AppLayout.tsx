import React, { useEffect, useState } from "react";
import { observer } from "mobx-react";
import { useLoadingRoute } from "react-navi";
import { Menu, Button, Dropdown, Container, Icon, Segment, Sidebar, SemanticICONS } from "semantic-ui-react";

import "fomantic-ui-css/components/site.css";
import "noty/src/themes/semanticui.scss";

import style from "./AppLayout.module.less";

import GlobalProgressBar from "@/components/GlobalProgressBar";

import { Locale } from "@/interfaces/Locale";
import localeMeta from "@/locales/meta";
import { appState } from "@/appState";
import {
  useLocalizer,
  useLoginOrRegisterNavigation,
  useScreenWidthWithin,
  useNavigationChecked,
  Link
} from "@/utils/hooks";
import toast from "@/utils/toast";
import api from "@/api";
import formatDateTime from "@/utils/formatDateTime";
import { EmojiRenderer } from "@/components/EmojiRenderer";

export type NavButtonName = "home" | "problem_set" | "submissions" | "members" | "discussion";

let AppLayout: React.FC = props => {
  const navigation = useNavigationChecked();
  const loadingRoute = useLoadingRoute();
  const _ = useLocalizer("common");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen !== document.documentElement.classList.contains(style.sidebarOpen))
      document.documentElement.classList.toggle(style.sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    const subscription = navigation.subscribe(route => {
      if (route.type === "ready") {
        setSidebarOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  });

  async function onLogoutClick() {
    const { requestError, response } = await api.auth.logout();
    if (requestError) {
      toast.error(requestError(_));
    } else {
      appState.token = null;
      appState.logout = true;
      location.reload();
    }
  }

  const onLoginOrRegisterClick = useLoginOrRegisterNavigation();

  const navButtons: Record<NavButtonName, { icon: SemanticICONS; text: string; url?: string }> = {
    home: {
      icon: "home",
      text: ".navbar.home",
      url: "/"
    },
    problem_set: {
      icon: "book",
      text: ".navbar.problem_set",
      url: "/p"
    },
    ...(appState.serverPreference.misc.legacyContestsEntryUrl
      ? {
          contests: {
            icon: "dove",
            text: ".navbar.contests",
            url: appState.serverPreference.misc.legacyContestsEntryUrl
          }
        }
      : {}),
    submissions: {
      icon: "hourglass",
      text: ".navbar.submissions",
      url: "/s"
    },
    members: {
      icon: "users",
      text: ".navbar.members",
      url: "/u"
    },
    discussion: {
      icon: "comments",
      text: ".navbar.discussion",
      url: "/d"
    }
  };

  const navMenuItems = Object.keys(navButtons).map(name => (
    <Menu.Item key={name} as={Link} href={navButtons[name].url} active={appState.activeNavButton === name}>
      <Icon name={navButtons[name].icon} />
      {_(navButtons[name].text)}
    </Menu.Item>
  ));

  const loginAndRegisterButtons = (
    <>
      <Button className={style.loginAndRegisterButton} onClick={() => onLoginOrRegisterClick("login")}>
        {_(".header.user.login")}
      </Button>
      <Button className={style.loginAndRegisterButton} primary onClick={() => onLoginOrRegisterClick("register")}>
        {_(".header.user.register")}
      </Button>
    </>
  );

  const userMenu = () => (
    <>
      <Dropdown.Menu className={style.userMenu}>
        <Dropdown.Item as={Link} href={`/u/${appState.currentUser.username}`}>
          <Icon name="user" />
          {_(".header.user.profile")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={{ pathname: "/s", query: { submitter: appState.currentUser.username } }}>
          <Icon name="hourglass half" />
          {_(".header.user.submissions")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={{ pathname: "/p", query: { ownerId: appState.currentUser.id } }}>
          <Icon name="book" />
          {_(".header.user.problems")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={{ pathname: "/d", query: { publisherId: appState.currentUser.id } }}>
          <Icon name="comments" />
          {_(".header.user.discussions")}
        </Dropdown.Item>
        {appState.currentUserJoinedGroupsCount > 0 && (
          <Dropdown.Item as={Link} href="/groups">
            <Icon name="users" />
            {_(".header.user.groups")}
          </Dropdown.Item>
        )}
        {Dropdown === Dropdown && <Dropdown.Divider />}
        <Dropdown.Item as={Link} href={`/u/${appState.currentUser.username}/edit/profile`}>
          <Icon name="edit" />
          {_(".header.user.edit_profile")}
        </Dropdown.Item>
        <Dropdown.Item as={Link} href={`/u/${appState.currentUser.username}/edit/preference`}>
          <Icon name="cog" />
          {_(".header.user.preference")}
        </Dropdown.Item>
        <Dropdown.Item onClick={onLogoutClick}>
          <Icon name="power" />
          {_(".header.user.logout")}
        </Dropdown.Item>
      </Dropdown.Menu>
    </>
  );

  const logo = (
    <Menu.Item as={Link} href="/" className={style.logoItem}>
      <div className={style.content}>
        {appState.appLogoThemed && (
          <div className={style.logo}>
            <img {...appState.appLogoThemed} />
          </div>
        )}
        <EmojiRenderer>
          <div className={style.siteName}>{appState.serverPreference.siteName}</div>
        </EmojiRenderer>
      </div>
    </Menu.Item>
  );

  const getFooter = (className: string) => (
    <>
      <Segment vertical className={className}>
        <Container textAlign="center">
          <EmojiRenderer>
            <div>{appState.serverPreference.siteName} Powered by Lyrio</div>
          </EmojiRenderer>
          <div id={style.footerVersion} className="monospace">
            <span>
              F: <span title={formatDateTime(window.appVersion.date)[1]}>{window.appVersion.hash}</span>
            </span>
            &nbsp;/&nbsp;
            <span>
              B: <span title={formatDateTime(appState.serverVersion.date)[1]}>{appState.serverVersion.hash}</span>
            </span>
          </div>
          <div className={style.footerIcons}>
            <Link href="/judge-machine" title={_(".footer.judge_machine")}>
              <Icon name="server" />
            </Link>
            <Dropdown icon="language" title={_(".footer.locale")}>
              <Dropdown.Menu className={style.languageSwitchMenu}>
                {Object.keys(localeMeta).map((locale: Locale) => (
                  <Dropdown.Item
                    key={locale}
                    onClick={() => {
                      appState.localLocale = locale;
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
            <Link href="https://github.com/lyrio-dev" title="GitHub" target="_blank" rel="noreferrer noopener">
              <Icon name="github" />
            </Link>
          </div>
        </Container>
      </Segment>
    </>
  );

  const userDropdown = (icon = true) => (
    <Menu.Menu position="right">
      <Dropdown
        simple
        item
        open={false}
        icon={icon && <i className="dropdown icon"></i>}
        text={appState.currentUser.username}
      >
        {userMenu()}
      </Dropdown>
    </Menu.Menu>
  );

  const topBarItemsForWideScreen = (
    <>
      {navMenuItems}
      {appState.currentUser ? (
        userDropdown()
      ) : (
        <Menu.Item className={style.userContainer}>{loginAndRegisterButtons}</Menu.Item>
      )}
    </>
  );

  const topBarItemsForNarrowScreen = (
    <Menu.Menu position="right">
      {appState.currentUser && userDropdown(false)}
      <Menu.Item icon="bars" onClick={() => setSidebarOpen(true)} />
    </Menu.Menu>
  );

  const wide = useScreenWidthWithin(1024, Infinity);

  const sidebarOpenStatusClassName = sidebarOpen ? " " + style.sidebarOpen : "";

  return (
    <>
      <GlobalProgressBar isAnimating={!!loadingRoute} />
      <Menu borderless fixed="top" className={style.menu}>
        <Container id={style.mainMenuContainer}>
          {logo}
          {wide ? topBarItemsForWideScreen : topBarItemsForNarrowScreen}
        </Container>
      </Menu>
      {getFooter(style.footer + " " + style.real)}
      <Container id={style.mainUiContainer}>{props.children}</Container>
      {getFooter(style.footer + " " + style.placeholder)}
      {!wide && (
        <>
          <div className={style.sidebarDimmer + sidebarOpenStatusClassName} onClick={() => setSidebarOpen(false)}></div>
          <Sidebar
            as={Menu}
            className={style.sidebarMenu + sidebarOpenStatusClassName}
            animation="push"
            direction="right"
            vertical
            visible
          >
            <Menu.Item className={style.siteName} as={Link} href="/">
              {appState.serverPreference.siteName}
            </Menu.Item>
            {!appState.currentUser && (
              <Menu.Item>
                <Button.Group fluid>{loginAndRegisterButtons}</Button.Group>
              </Menu.Item>
            )}
            {navMenuItems}
          </Sidebar>
        </>
      )}
    </>
  );
};

AppLayout = observer(AppLayout);

export default AppLayout;

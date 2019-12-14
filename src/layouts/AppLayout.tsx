import React from "react";
import { FormattedMessage } from "react-intl";
import { observer } from "mobx-react";
import { Link, useHistory } from "react-router-dom";
import { Layout, Menu, Icon, Button, Dropdown, Avatar, message } from "antd";

import gravatar from "gravatar";

import style from "./AppLayout.module.less";
import Logo from "@/assets/syzoj-applogo.svg";

import { appState } from "@/appState";
import { appConfig } from "@/appConfig";

import { AuthApi } from "@/api";

const { Header, Content, Footer, Sider } = Layout;

const AppLayout: React.FC = props => {
  const history = useHistory();

  async function onLogoutClick() {
    const { requestError, response } = await AuthApi.logout();
    if (requestError) {
      message.error(requestError);
    } else {
      appState.token = appState.loggedInUser = null;
      // TODO: Should we refresh the page?
    }
  }

  function onLoginOrRegisterClick(loginOrRegister: string) {
    // Save the current url for redirecting back
    if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      appState.loginRedirectUrl = currentUrl;
    }

    history.push("/" + loginOrRegister);
  }

  const navButtons = {
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
      icon: "team",
      text: "common.navbar.members",
      url: "/members"
    },
    discussion: {
      icon: "message",
      text: "common.navbar.discussion",
      url: "/discussion"
    },
    help: {
      icon: "question-circle",
      text: "common.navbar.help",
      url: "/help"
    }
  };

  function onNavButtonClick(name: string) {
    history.push(navButtons[name].url);
  }

  const userPanel = appState.loggedInUser ? (
    <>
      <Dropdown
        overlay={
          <Menu className={style.userMenu}>
            <Menu.Item>
              <Link to="/settings">
                <Icon type="setting" />
                <FormattedMessage id="common.header.user.settings" />
              </Link>
            </Menu.Item>
            <Menu.Item>
              <a onClick={onLogoutClick}>
                <Icon type="poweroff" />
                <FormattedMessage id="common.header.user.logout" />
              </a>
            </Menu.Item>
          </Menu>
        }
      >
        <div className={style.dropdownWrapper}>
          <Avatar
            size={36}
            src={gravatar.url(appState.loggedInUser.email, {
              s: "72",
              d: "mm"
            })}
          />
          <span className={style.username}>{appState.loggedInUser.username}</span>
          <Icon type="down" />
        </div>
      </Dropdown>
    </>
  ) : (
    <>
      <Button onClick={() => onLoginOrRegisterClick("login")}>
        <FormattedMessage id="common.header.user.login" />
      </Button>
      <Button onClick={() => onLoginOrRegisterClick("register")} type="primary">
        <FormattedMessage id="common.header.user.register" />
      </Button>
    </>
  );

  return (
    <Layout className={style.outerLayout}>
      <Sider
        width={56}
        collapsed={true}
        collapsedWidth={56}
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0
        }}
      >
        <Link to="/">
          <div className={style.sidebarLogo}>
            <Logo />
          </div>
        </Link>
        <Menu className={style.sidebarMenu} theme="light" mode="inline" defaultSelectedKeys={["1"]}>
          {Object.keys(navButtons).map(name => (
            <Menu.Item key={name} className={style.sidebarMenuItem} onClick={() => onNavButtonClick(name)}>
              <Icon type={navButtons[name].icon} />
              <span>
                <FormattedMessage id={navButtons[name].text} />
              </span>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout className={style.innerLayout}>
        <Content className={style.content}>{props.children}</Content>
        <Header className={style.header}>
          <div className={style.user}>{userPanel}</div>
        </Header>
        <Footer className={style.footer}>
          {appConfig.siteName}
          &nbsp;Powered by SYZOJ
        </Footer>
      </Layout>
    </Layout>
  );
};

export default observer(AppLayout);

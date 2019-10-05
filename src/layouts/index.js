import React from "react";
import { connect } from "dva";
import Helmet from "react-helmet";
import NavLink from "umi/navlink";
import router from "umi/router";
import withRouter from 'umi/withRouter';
import { FormattedMessage, setLocale } from "umi/locale";

import enUS from "antd/es/locale/en_US";
import zhCN from "antd/es/locale/zh_CN";

import { ConfigProvider, Layout, Menu, Icon, Button, Dropdown, Avatar } from "antd";

import style from "./index.less";
import Logo from "@/assets/syzoj-applogo.svg"

const { Header, Content, Footer, Sider } = Layout;

const locales = {
  "en-US": enUS,
  "zh-CN": zhCN
};

@withRouter
@connect(({ app }) => ({
  locale: app.locale,
  title: app.title,
  siteInfo: app.siteInfo,
  loggedIn: app.loggedIn,
  loggedInUser: app.loggedInUser,
  loginRedirectUrl: app.loginRedirectUrl
}))
class AppLayout extends React.Component {
  componentDidMount() {
    setLocale(this.props.locale, false);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.locale !== this.props.locale) {
      setLocale(this.props.locale, false);
    }
  }

  onLogoutClick() {
    this.props.dispatch({
      type: "app/logout"
    });
  }

  onLoginOrRegisterClick(loginOrRegister) {
    return () => {
      // Save the current url for redirecting back
      if (window.location.pathname !== "/login" && window.location.pathname !== "/register") {
        const currentUrl = window.location.pathname + window.location.search + window.location.hash;
        this.props.dispatch({
          type: "app/setLoginRedirectUrl",
          payload: {
            loginRedirectUrl: currentUrl
          }
        });
      }
      router.push("/" + loginOrRegister);
    };
  }

  render() {
    const navButtons = {
      home: {
        icon: "home",
        text: "syzoj.common.navbar.home"
      },
      problem_set: {
        icon: "book",
        text: "syzoj.common.navbar.problem_set"
      },
      contests: {
        icon: "calendar",
        text: "syzoj.common.navbar.contests"
      },
      submissions: {
        icon: "hourglass",
        text: "syzoj.common.navbar.submissions"
      },
      members: {
        icon: "team",
        text: "syzoj.common.navbar.members"
      },
      discussion: {
        icon: "message",
        text: "syzoj.common.navbar.discussion"
      },
      help: {
        icon: "question-circle",
        text: "syzoj.common.navbar.help"
      }
    }

    const userPanel = this.props.loggedIn ? (
      <div>
        <Dropdown
          overlay={
            <Menu className={style.userMenu}>
              <Menu.Item>
                <NavLink to="/settings">
                  <Icon type="setting" />
                  <FormattedMessage id="syzoj.common.header.user.settings" />
                </NavLink>
              </Menu.Item>
              <Menu.Item>
                <a onClick={this.onLogoutClick.bind(this)}>
                  <Icon type="poweroff" />
                  <FormattedMessage id="syzoj.common.header.user.logout" />
                </a>
              </Menu.Item>
            </Menu>
          }
        >
          <div className={style.dropdownWrapper}>
            <Avatar size={36} icon="user" />
            <span className={style.username}>
              {this.props.loggedInUser.username}
            </span>
            <Icon type="down" />
          </div>
        </Dropdown>
      </div>
    ) : (
      <div>
        <Button onClick={this.onLoginOrRegisterClick("login")}>
          <FormattedMessage id="syzoj.common.header.user.login" />
        </Button>
        <Button onClick={this.onLoginOrRegisterClick("register")} type="primary">
          <FormattedMessage id="syzoj.common.header.user.register" />
        </Button>
      </div>
    );

    return (
      <ConfigProvider
        autoInsertSpaceInButton={false}
        locale={locales[this.props.locale]}
      >
        <Helmet>
          <title>{this.props.title} - {this.props.siteInfo.siteName}</title>
        </Helmet>
        <Layout
          style={{ minHeight: "100%" }}
        >
          <Sider
            width={56}
            collapsed={true}
            collapsedWidth={56}
            style={{
              overflow: "hidden",
              height: "100vh",
              position: "fixed",
              left: 0,
            }}
          >
            <NavLink to="/">
              <div className={style.sidebarLogo}>
                <Logo />
              </div>
            </NavLink>
            <Menu
              className={style.sidebarMenu}
              theme="light"
              mode="inline"
              defaultSelectedKeys={["1"]}
            >
              {
                Object.keys(navButtons).map(name =>
                  <Menu.Item key={name} className={style.sidebarMenuItem}>
                    <Icon type={navButtons[name].icon} />
                    <FormattedMessage id={navButtons[name].text} />
                  </Menu.Item>
                )
              }
            </Menu>
          </Sider>
          <Layout style={{ marginLeft: 56 }}>
            <Header className={style.header}>
              <div className={style.user}>
                {userPanel}
              </div>
            </Header>
            <Content className={style.content}>
              {this.props.children}
            </Content>
            <Footer style={{ textAlign: "center" }}>
              {this.props.siteInfo.siteName}
              &nbsp;Powered by SYZOJ
            </Footer>
          </Layout>
        </Layout>
      </ConfigProvider>
    );
  }
}

export default AppLayout;

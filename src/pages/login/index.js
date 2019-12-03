import React from "react";
import { connect } from "dva";
import { formatMessage, FormattedMessage } from "umi/locale";
import router from "umi/router";

import { Icon, Input, Button, Checkbox, Form } from "antd";

import style from "./index.less";
import UserIcon from "@/assets/user.svg";

@connect(({ login, app }) => ({
  ...login,
  loginRedirectUrl: app.loginRedirectUrl
}))
class LoginPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      remember: false
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: "app/setTitle",
      payload: {
        title: formatMessage({ id: "syzoj.login.title" })
      }
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: "login/resetState"
    });
  }

  onChange(stateName, valueKey = "value") {
    return e => {
      this.setState({
        [stateName]: e.target[valueKey]
      });
    };
  }

  onLogin(e) {
    this.props.dispatch({
      type: "login/login",
      payload: this.state
    });
  }

  componentDidUpdate() {
    if (this.props.success) {
      setTimeout(() => {
        router.push(this.props.loginRedirectUrl || "/");
      }, 1000);
    }
  }

  render() {
    return (
      <div className={style.wrapper}>
        <Icon component={UserIcon} className={style.userIcon} />
        <div className={style.row}>
          <Form.Item
            validateStatus={
              this.props.success
                ? "success"
                : this.props.error.type === "username"
                ? "error"
                : ""
            }
            hasFeedback
            help={
              this.props.error.type === "username"
                ? this.props.error.message
                : ""
            }
          >
            <Input
              size="large"
              prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder={formatMessage({ id: "syzoj.login.username" })}
              value={this.state.username}
              onChange={this.onChange("username")}
              onPressEnter={() => {
                this.refPassword.input.focus();
                this.refPassword.input.select();
              }}
            />
          </Form.Item>
        </div>
        <div className={style.row}>
          <Form.Item
            validateStatus={
              this.props.success
                ? "success"
                : this.props.error.type === "password"
                ? "error"
                : ""
            }
            hasFeedback
            help={
              this.props.error.type === "password"
                ? this.props.error.message
                : ""
            }
          >
            <Input
              size="large"
              prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
              type="password"
              placeholder={formatMessage({ id: "syzoj.login.password" })}
              value={this.state.password}
              onChange={this.onChange("password")}
              onPressEnter={this.onLogin.bind(this)}
              ref={ref => (this.refPassword = ref)}
            />
          </Form.Item>
        </div>
        <div className={style.compactRow}>
          <Checkbox
            disabled
            checked={this.state.remember}
            onChange={this.onChange("remember", "checked")}
          >
            <FormattedMessage id="syzoj.login.remember" />
          </Checkbox>
          <a className={style.forgetLink}>
            <FormattedMessage id="syzoj.login.forget" />
          </a>
        </div>
        <div className={style.compactRow}>
          <Button
            size="large"
            type="primary"
            block
            loading={this.props.pending}
            onClick={this.onLogin.bind(this)}
          >
            <FormattedMessage id="syzoj.login.login" />
          </Button>
        </div>
      </div>
    );
  }
}

export default LoginPage;

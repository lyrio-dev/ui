import React, { useEffect } from "react";
import { Message, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { useNavigation } from "react-navi";

import style from "./ErrorPage.module.less";

import { useIntlMessage } from "@/utils/hooks";
import { appState } from "@/appState";

export interface ErrorPageProps {
  uncaughtError?: Error;
  message: React.ReactNode;
  options: {
    showRefresh?: true;
    showBack?: true;
  };
}

let ErrorPage: React.FC<ErrorPageProps> = props => {
  const _ = useIntlMessage();
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(_("error.title"));
  }, [appState.locale]);

  if (props.uncaughtError) console.error(props.uncaughtError);

  return (
    <Message className={style.message} icon negative>
      <Icon name="remove" />
      <Message.Content>
        <Message.Header>{_(props.uncaughtError ? "error.unexpected_error" : "error.error")}</Message.Header>
        {props.uncaughtError ? (
          <>
            <p>
              <pre>{props.uncaughtError.stack}</pre>
            </p>
            <p>
              <a onClick={() => location.reload()}>{_("error.refresh")}</a>
            </p>
          </>
        ) : (
          <>
            <p>{props.message}</p>
            <p>
              {props.options.showBack && <a onClick={() => navigation.goBack()}>{_("error.back")}</a>}
              {props.options.showRefresh && <a onClick={() => navigation.refresh()}>{_("error.refresh")}</a>}
            </p>
          </>
        )}
      </Message.Content>
    </Message>
  );
};

export default observer(ErrorPage);

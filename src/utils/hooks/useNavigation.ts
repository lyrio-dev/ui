import React, { useEffect, useRef, useState } from "react";
import { makeObservable, observable } from "mobx";
import { useNavigation, Link as NaviLink } from "react-navi";
import { LinkProps } from "react-navi/dist/types/Link";

import { useLocalizer } from "./useLocalizer";

class ConfirmNavigationState {
  constructor() {
    makeObservable(this);
  }

  @observable
  count = 0;
}

const confirmNavigationState = new ConfirmNavigationState();

window.addEventListener("beforeunload", e => {
  if (confirmNavigationState.count > 0) {
    e.preventDefault();
    e.returnValue = "";
    return "";
  }
});

function useNavigationConfirm() {
  const _ = useLocalizer("common");

  return function confirmNavigation() {
    if (confirmNavigationState.count > 0) {
      return confirm(_(".confirm_navigation"));
    }

    return true;
  };
}

export function useNavigationChecked() {
  const navigation = useNavigation();
  const confirmNavigation = useNavigationConfirm();

  function wrap<Method extends keyof typeof navigation>(method: Method): typeof navigation[Method] {
    return function () {
      if (!confirmNavigation()) return;
      return (navigation[method] as Function).apply(navigation, arguments);
    } as any;
  }

  return {
    goBack: wrap("goBack"),
    navigate: wrap("navigate"),
    refresh: wrap("refresh"),
    subscribe: navigation.subscribe.bind(navigation),
    unconfirmed: {
      goBack: navigation.goBack.bind(navigation),
      navigate: navigation.navigate.bind(navigation),
      refresh: navigation.refresh.bind(navigation)
    }
  };
}

export function useConfirmNavigation(): [boolean, (confirm: boolean) => void] {
  const refConfirm = useRef<boolean>(false);
  const [stateConfirm, setStateConfirm] = useState(false);

  useEffect(() => () => refConfirm.current && confirmNavigationState.count--, []);

  return [
    stateConfirm,
    (confirm: boolean) => {
      if (confirm != refConfirm.current) {
        refConfirm.current = confirm;
        setStateConfirm(confirm);

        confirmNavigationState.count += confirm ? 1 : -1;
      }
    }
  ];
}

export const Link: React.FC<LinkProps> = props => {
  const confirmNavigation = useNavigationConfirm();

  return React.createElement(NaviLink, {
    ...props,
    onClick: e => {
      if (!confirmNavigation()) e.preventDefault();
      if (props.onClick) return props.onClick(e);
    }
  });
};

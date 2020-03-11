import React, { useEffect } from "react";
import { route } from "navi";
import { observer } from "mobx-react";

import { appState } from "@/appState";
import { useIntlMessage } from "@/utils/hooks";

let HomePage: React.FC = () => {
  const _ = useIntlMessage();

  useEffect(() => {
    appState.enterNewPage(_("home.title"));
  }, [appState.locale]);

  return <>Hello, world!</>;
};

HomePage = observer(HomePage);

export default route({
  view: <HomePage />
});

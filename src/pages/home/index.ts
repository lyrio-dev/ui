import { lazy } from "navi";

export default {
  home: lazy(() => import("./home/HomePage")),
  homeSettings: lazy(() => import("./home-settings/HomeSettingsPage"))
};

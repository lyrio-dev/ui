import { mount, lazy, redirect } from "navi";

import { legacyRoutes } from "@/AppRouter";
import getRoute from "@/utils/getRoute";

export default {
  users: lazy(() => import("./users/UsersPage")),
  groups: lazy(() => import("./groups/GroupsPage")),
  user: mount({
    "/:userId": getRoute(() => import("./user/UserPage"), "byId"),
    "/:userId/edit/:type": getRoute(() => import("./edit/UserEditPage"), "byId"),
    ...legacyRoutes({
      "/:userId/edit": redirect(request => `/user/${request.params.userId}/edit/profile`)
    })
  }),
  u: mount({
    "/:username": getRoute(() => import("./user/UserPage"), "byUsername"),
    "/:username/edit/:type": getRoute(() => import("./edit/UserEditPage"), "byUsername")
  })
};

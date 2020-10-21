import getRoute from "@/utils/getRoute";
import { mount, lazy } from "navi";

export default {
  users: lazy(() => import("./users/UsersPage")),
  groups: lazy(() => import("./groups/GroupsPage")),
  user: mount({
    "/:userId": getRoute(() => import("./user/UserPage"), "byId"),
    "/:userId/edit/:type": getRoute(() => import("./edit/UserEditPage"), "byId")
  }),
  u: mount({
    "/:username": getRoute(() => import("./user/UserPage"), "byUsername"),
    "/:username/edit/:type": getRoute(() => import("./edit/UserEditPage"), "byUsername")
  })
};

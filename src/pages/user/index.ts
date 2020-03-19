import { mount, lazy } from "navi";

export default {
  users: lazy(() => import("./users/UsersPage")),
  user: mount({
    "/:userId": lazy(() => import("./user/UserPage")),
    "/:userId/edit/:type": lazy(() => import("./edit/UserEditPage"))
  })
};

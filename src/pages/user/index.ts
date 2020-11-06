import { mount, lazy, redirect } from "navi";

import { defineRoute, legacyRoutes, RouteError } from "@/AppRouter";
import getRoute from "@/utils/getRoute";
import { makeToBeLocalizedText } from "@/locales";
import api from "@/api";

const redirectToUsernameRoute = defineRoute(async request => {
  const userId = Number(request.params.userId);
  if (!userId) throw new RouteError(makeToBeLocalizedText(`user_edit.errors.NO_SUCH_USER`));

  const { requestError, response } = await api.user.getUserMeta({
    userId
  });
  if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
  else if (response.error) throw new RouteError(makeToBeLocalizedText(`user_edit.errors.${response.error}`));

  // /user/:userId/edit/profile
  // ["", "user", ":userId", "edit", "profile"]
  // =>
  // /u/:username/edit/profile
  // ["", "u", ":username", "edit", "profile"]
  const splitted = request.originalUrl.split("/");
  splitted[1] = "u";
  splitted[2] = response.meta.username;
  return redirect(splitted.join("/"));
});

export default {
  groups: lazy(() => import("./groups/GroupsPage")),
  user: mount({
    "/:userId": mount({
      ...legacyRoutes({
        edit: redirect(request => `/user/${request.params.userId}/edit/profile`)
      }),
      "/edit/:type": redirectToUsernameRoute,
      "/": redirectToUsernameRoute
    })
  }),
  u: mount({
    "/:username": getRoute(() => import("./user/UserPage"), "byUsername"),
    "/:username/edit/:type": lazy(() => import("./edit/UserEditPage")),
    "/": lazy(() => import("./users/UsersPage"))
  })
};

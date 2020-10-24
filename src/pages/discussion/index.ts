import { mount, lazy, redirect } from "navi";

import getRoute from "@/utils/getRoute";
import { legacyRoutes } from "@/AppRouter";

export default {
  discussion: mount({
    "/:id": mount({
      "/": lazy(() => import("./view/DiscussionViewPage")),
      "/edit": getRoute(() => import("./edit/DiscussionEditPage"), "edit")
    }),
    "/new": getRoute(() => import("./edit/DiscussionEditPage"), "new"),
    ...legacyRoutes({
      "/global": redirect("/discussions"),
      "/problems": redirect("/discussions?problemId=all"),
      "/problem/:id": redirect(request => `/discussions?problemId=${request.params.id}`)
    })
  }),
  discussions: mount({
    "/": lazy(() => import("./discussions/DiscussionsPage"))
  })
};

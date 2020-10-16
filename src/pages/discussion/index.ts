import { mount, lazy } from "navi";

import getRoute from "@/utils/getRoute";

export default {
  discussion: mount({
    "/:id": mount({
      "/": lazy(() => import("./view/DiscussionViewPage")),
      "/edit": getRoute(() => import("./edit/DiscussionEditPage"), "edit")
    }),
    "/new": getRoute(() => import("./edit/DiscussionEditPage"), "new")
  }),
  discussions: mount({
    "/": lazy(() => import("./discussions/DiscussionsPage"))
  })
};

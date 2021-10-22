import { mount, lazy } from "navi";

import getRoute from "@/utils/getRoute";

export default mount({
  "/:id": mount({
    "/": lazy(() => import("./view/ContestViewPage")),
    "/edit": getRoute(() => import("./edit/ContestEditPage"), "edit")
    //   "/ranklist": lazy(() => import("./ranklist/ContestRanklistPage")),
    //   "/p/:id": getRoute(() => import("../problem/view/ProblemViewPage"), "inContest")
  }),
  "/new": getRoute(() => import("./edit/ContestEditPage"), "new"),
  "/": lazy(() => import("./contests/ContestsPage"))
});

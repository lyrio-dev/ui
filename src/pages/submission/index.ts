import { mount, lazy } from "navi";

import getRoute from "@/utils/getRoute";

export default {
  submissions: mount({
    "/": lazy(() => import("./submissions/SubmissionsPage")),
    "/statistics/by-id/:id/:type": getRoute(() => import("./statistics/SubmissionStatisticsPage"), "byId"),
    "/statistics/:displayId/:type": getRoute(() => import("./statistics/SubmissionStatisticsPage"), "byDisplayId")
  }),
  submission: mount({
    "/:id": lazy(() => import("./submission/SubmissionPage"))
  })
};

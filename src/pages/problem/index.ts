import { mount, lazy, redirect } from "navi";

import getRoute from "@/utils/getRoute";
import { legacyRoutes } from "@/AppRouter";

export default {
  p: mount({
    "/id/:id": mount({
      "/": getRoute(() => import("./view/ProblemViewPage"), "byId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byId"),
      "/statistics/:type": getRoute(() => import("@/pages/submission/statistics/SubmissionStatisticsPage"), "byId")
    }),
    "/:displayId": mount({
      "/": getRoute(() => import("./view/ProblemViewPage"), "byDisplayId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byDisplayId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byDisplayId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byDisplayId"),
      "/statistics/:type": getRoute(
        () => import("@/pages/submission/statistics/SubmissionStatisticsPage"),
        "byDisplayId"
      )
    }),
    "/new": getRoute(() => import("./edit/ProblemEditPage"), "new"),
    "/": lazy(() => import("./problem-set/ProblemSetPage"))
  }),
  ...legacyRoutes({
    problem: mount({
      "/0/edit": redirect("/p/new"),
      "/:id": redirect(request => `/p/${request.params.id}`),
      "/:id/manage": redirect(request => `/p/${request.params.id}/judge-settings`),
      "/:id/additional_file": redirect(request => `/p/${request.params.id}/files`),
      "/:id/testdata": redirect(request => `/p/${request.params.id}/files`),
      "/:id/statistics/fastest": redirect(request => `/p/${request.params.id}/statistics/fastest`),
      "/:id/statistics/shortest": redirect(request => `/p/${request.params.id}/statistics/minanswersize`),
      "/:id/statistics/min": redirect(request => `/p/${request.params.id}/statistics/minmemory`),
      "/:id/statistics/earliest": redirect(request => `/p/${request.params.id}/statistics/earliest`)
    }),
    problems: mount({
      "/": redirect(() => "/p"),
      "/search": redirect(request => ({ pathname: "/p", query: request.query })),
      "/tag/:ids": redirect(request => `/p?tagIds=${request.params.ids}`)
    })
  })
};

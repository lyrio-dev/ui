import { mount, lazy, redirect } from "navi";

import getRoute from "@/utils/getRoute";
import { legacyRoutes } from "@/AppRouter";

export default {
  problem: mount({
    "/by-id/:id": mount({
      "/": getRoute(() => import("./view/ProblemViewPage"), "byId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byId")
    }),
    "/:displayId": mount({
      "/": getRoute(() => import("./view/ProblemViewPage"), "byDisplayId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byDisplayId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byDisplayId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byDisplayId")
    }),
    "/new": getRoute(() => import("./edit/ProblemEditPage"), "new"),
    ...legacyRoutes({
      "/0/edit": redirect("/problem/new"),
      "/:id/manage": redirect(request => `/problem/${request.params.id}/judge-settings`),
      "/:id/additional_file": redirect(request => `/problem/${request.params.id}/files`),
      "/:id/testdata": redirect(request => `/problem/${request.params.id}/files`),
      "/:id/statistics/fastest": redirect(request => `/submission/statistics/${request.params.id}/fastest`),
      "/:id/statistics/shortest": redirect(request => `/submission/statistics/${request.params.id}/minanswersize`),
      "/:id/statistics/min": redirect(request => `/submission/statistics/${request.params.id}/minmemory`),
      "/:id/statistics/earliest": redirect(request => `/submission/statistics/${request.params.id}/earliest`)
    })
  }),
  problems: mount({
    "/": lazy(() => import("./problem-set/ProblemSetPage")),
    ...legacyRoutes({
      "/search": redirect(request =>
        request.params.keyword ? `/problems?keyword=${request.params.keyword}` : "/problems"
      ),
      "/tag/:ids": redirect(request => `/problems?tagIds=${request.params.ids}`)
    })
  })
};

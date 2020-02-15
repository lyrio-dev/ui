import { mount } from "navi";
import getRoute from "@/utils/getRoute";

export default {
  problem: mount({
    "/by-id/:id": mount({
      "/": getRoute(() => import("./index/ProblemPage"), "byId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byId")
    }),
    "/:displayId": mount({
      "/": getRoute(() => import("./index/ProblemPage"), "byDisplayId"),
      "/edit": getRoute(() => import("./edit/ProblemEditPage"), "byDisplayId"),
      "/files": getRoute(() => import("./files/ProblemFilesPage"), "byDisplayId"),
      "/judge-settings": getRoute(() => import("./judge-settings/ProblemJudgeSettingsPage"), "byDisplayId")
    }),
    "/new": getRoute(() => import("./edit/ProblemEditPage"), "new")
  }),
  problems: mount({
    "/": getRoute(() => import("./problem-set/ProblemSetPage"), "public")
  })
};

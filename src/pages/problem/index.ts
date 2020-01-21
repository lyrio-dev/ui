import { mount } from "navi";
import getRoute from "@/utils/getRoute";

export default mount({
  "/by-id/:id": mount({
    "/": getRoute(import("./ProblemPage"), "byId"),
    "/edit": getRoute(import("./ProblemEditPage"), "byId"),
    "/files": getRoute(import("./ProblemFilesPage"), "byId")
  }),
  "/:displayId": mount({
    "/": getRoute(import("./ProblemPage"), "byDisplayId"),
    "/edit": getRoute(import("./ProblemEditPage"), "byDisplayId"),
    "/files": getRoute(import("./ProblemFilesPage"), "byDisplayId")
  }),
  "/new": getRoute(import("./ProblemEditPage"), "new")
});

import { mount } from "navi";
import getRoute from "@/utils/getRoute";

export default mount({
  "/by-id/:id": mount({
    "/": getRoute(import("./ProblemPage"), "byId"),
    "/edit": getRoute(import("./ProblemEditPage"), "byId")
  }),
  "/:displayId": mount({
    "/": getRoute(import("./ProblemPage"), "byDisplayId"),
    "/edit": getRoute(import("./ProblemEditPage"), "byDisplayId")
  }),
  "/new": getRoute(import("./ProblemEditPage"), "new")
});

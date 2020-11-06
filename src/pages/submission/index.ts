import { mount, lazy } from "navi";

export default {
  s: mount({
    "/:id": lazy(() => import("./submission/SubmissionPage")),
    "/": lazy(() => import("./submissions/SubmissionsPage"))
  })
};

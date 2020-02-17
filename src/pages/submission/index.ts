import { mount, lazy } from "navi";

export default {
  submissions: mount({
    "/": lazy(() => import("./submissions/SubmissionsPage"))
  }),
  submission: mount({
    "/:id": lazy(() => import("./submission/SubmissionPage"))
  })
};

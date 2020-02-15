import { mount, lazy } from "navi";

export default {
  submissions: mount({
    "/": lazy(() => import("./submissions/SubmissionsPage"))
  })
};

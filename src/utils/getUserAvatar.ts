import gravatar from "gravatar";

import { UserMeta } from "@/interfaces/UserMeta";

export default function getUserAvatar(user: UserMeta, size: number = 150) {
  return gravatar.url(user.email, {
    size: size.toString(),
    default: "mm"
  });
}

import { UserMeta } from "@/interfaces/UserMeta";

// TODO: make the gravatar url configurable
export default function getUserAvatar(user: UserMeta, size: number = 150) {
  return `https://www.gravatar.com/avatar/${user.gravatarEmailHash}?size=${size}&default=mm`;
}

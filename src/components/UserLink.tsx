import React from "react";
import { Link } from "react-navi";

import { UserMeta } from "@/interfaces/UserMeta";

interface UserLinkProps {
  user: UserMeta;
}

const UserLink: React.FC<UserLinkProps> = props => {
  // TODO: rating color
  return <Link href={`/u/${props.user.username}`}>{props.children || props.user.username}</Link>;
};

export default UserLink;

import React from "react";

import { UserMeta } from "@/interfaces/UserMeta";
import { Link } from "@/utils/hooks";

interface UserLinkProps {
  className?: string;
  user: UserMeta;
}

const UserLink: React.FC<UserLinkProps> = props => {
  // TODO: rating color
  return <Link className={props.className} href={`/u/${props.user.username}`}>{props.children || props.user.username}</Link>;
};

export default UserLink;

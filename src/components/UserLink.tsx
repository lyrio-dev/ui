import React from "react";

import { UserMeta } from "@/interfaces/UserMeta";
import { Link } from "@/utils/hooks";

interface UserLinkProps {
  user: UserMeta;
}

const UserLink: React.FC<UserLinkProps> = props => {
  // TODO: rating color
  const escapedUsername = encodeURIComponent(props.user.username);
  return <Link href={`/u/${escapedUsername}`}>{props.children || props.user.username}</Link>;
};

export default UserLink;

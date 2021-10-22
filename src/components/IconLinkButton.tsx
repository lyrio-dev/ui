import React from "react";
import { Icon, SemanticICONS } from "semantic-ui-react";
import { URLDescriptor } from "navi";

import PseudoLink from "./PseudoLink";
import { Link } from "@/utils/hooks";

interface IconLinkButtonProps {
  className?: string;
  href?: string | Partial<URLDescriptor>;
  onClick?: () => void;
  icon: SemanticICONS;
  text: string;
  disabled?: boolean;
}

const IconLinkButton: React.FC<IconLinkButtonProps> = props =>
  props.disabled ? (
    <span className={props.className} onClick={props.onClick}>
      <Icon name={props.icon} />
      {props.text}
    </span>
  ) : props.href ? (
    <Link className={props.className} href={props.href} onClick={props.onClick}>
      <Icon name={props.icon} />
      {props.text}
    </Link>
  ) : (
    <PseudoLink className={props.className} onClick={props.onClick}>
      <Icon name={props.icon} />
      {props.text}
    </PseudoLink>
  );

export default IconLinkButton;

/**
 * A fake <a> element, looks like <a> but acts like a button
 */

import React from "react";

type PseudoLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const PseudoLink: React.FC<PseudoLinkProps> = React.memo(props => {
  return (
    <a
      {...props}
      href=""
      onClick={e => {
        e.preventDefault();
        if (props.onClick) props.onClick(e);
      }}
    >
      {props.children}
    </a>
  );
});

export default PseudoLink;

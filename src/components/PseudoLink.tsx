/**
 * A fake <a> element, looks like <a> but acts like a button
 */

import React from "react";

type PseudoLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const PseudoLink: React.FC<PseudoLinkProps> = React.memo(props => {
  return (
    <a {...props} ref={element => element && element.setAttribute("href", "javascript:void(0)")}>
      {props.children}
    </a>
  );
});

export default PseudoLink;

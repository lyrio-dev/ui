import React, { useEffect, useRef } from "react";
import { Ref } from "semantic-ui-react";
import twemoji from "twemoji";

import style from "./EmojiRenderer.module.less";

interface EmojiRendererProps {
  children: React.ReactElement;
}

export const getTwemojiOptions = (inline: boolean) =>
  ({
    base: window.twemojiCdn || "https://cdn.jsdelivr.net/npm/@discordapp/twemoji@13.0.1/dist/",
    size: "svg",
    ext: ".svg",
    className: inline ? style.emoji : "",
    callback: (icon, options: twemoji.ParseObject, variant) => {
      if (icon === "1f1f9-1f1fc") icon = "1f1e8-1f1f3";

      switch (icon) {
        // © copyright
        case "a9":
        // ® registered trademark
        case "ae":
        // ™ trademark
        case "2122":
          return false;
      }

      return `${options.base}${options.size}/${icon}${options.ext}`;
    }
  } as Partial<twemoji.ParseObject>);

export const EmojiRenderer: React.FC<EmojiRendererProps> = props => {
  const refElement = useRef<HTMLElement>();
  useEffect(() => {
    if (refElement.current) twemoji.parse(refElement.current, getTwemojiOptions(true));
  });

  return <Ref innerRef={refElement}>{props.children}</Ref>;
};

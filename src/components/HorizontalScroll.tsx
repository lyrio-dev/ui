import React, { useEffect, useRef, useState } from "react";

import style from "./HorizontalScroll.module.less";
import { useBoundingRect } from "@/utils/hooks/useBoundingRect";

interface HorizontalScrollProps {
  className?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = props => {
  const [width, setWidthReferenceElement] = useBoundingRect("width");
  const [height, setHeightReferenceElement] = useBoundingRect("height");

  const refScrollBarSizeTester = useRef<HTMLDivElement>();
  if (!refScrollBarSizeTester.current) {
    const div = document.createElement("div");
    div.style.overflowY = "scroll";
    div.style.width = div.style.height = "100px";
    div.style.position = "fixed";
    div.style.top = div.style.left = "-1000px";
    refScrollBarSizeTester.current = div;
  }

  const [scrollBarSize, setScrollBarSize] = useState(0);
  useEffect(() => {
    function onResize() {
      const div = refScrollBarSizeTester.current;
      if (div.parentNode) return;

      document.body.appendChild(div);
      setScrollBarSize(div.offsetWidth - div.clientWidth);
      document.body.removeChild(div);
    }

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  return (
    <div
      className={style.outerWrapper + (props.className ? " " + props.className : "")}
      ref={setWidthReferenceElement}
      style={{ height: height }}
    >
      <div
        className={style.middleWrapper}
        style={{ width: height + scrollBarSize, height: width, top: -scrollBarSize }}
      >
        <div className={style.innerWrapper} ref={setHeightReferenceElement}>
          {props.children}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScroll;

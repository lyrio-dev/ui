import React from "react";
import { Pagination, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./SimplePagination.module.less";

import { appState } from "@/appState";

interface SimplePaginationProps {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (direction: -1 | 1) => void;
}

let SimplePagination: React.FC<SimplePaginationProps> = props => {
  let size = "mini";
  if (appState.isScreenWidthIn(0, 375 + 1)) size = "mini";
  else if (appState.isScreenWidthIn(0, 425 + 1)) size = "mini";
  else if (appState.isScreenWidthIn(426, 540)) size = "small";
  else if (appState.isScreenWidthIn(540, 640)) size = "small";
  else if (appState.isScreenWidthIn(640, 768)) size = "small";
  else if (appState.isScreenWidthIn(768, 880)) size = "small";
  else if (appState.isScreenWidthIn(880, 1024)) size = null;
  else size = null;

  return (
    <div className={style.wrapper}>
      <Pagination
        size={size}
        className={style.pagination}
        activePage={2}
        siblingRange={0}
        firstItem={null}
        lastItem={null}
        prevItem={{ content: <Icon name="chevron left" />, icon: true, disabled: !props.hasPrevPage }}
        nextItem={{ content: <Icon name="chevron right" />, icon: true, disabled: !props.hasNextPage }}
        totalPages={3}
        onPageChange={(e, { activePage }) => {
          props.onPageChange((Number(activePage) - 2) as 1 | -1);
        }}
      />
    </div>
  );
};

export default observer(SimplePagination);

import React from "react";
import { Pagination as UIPagination, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./Pagination.module.less";
import { appState } from "@/appState";

interface PaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

let Pagination: React.FC<PaginationProps> = props => {
  const totalPages = Math.ceil(props.totalCount / props.itemsPerPage);

  let siblingRange = 1,
    size = "mini";
  if (appState.isScreenWidthIn(0, 375 + 1)) {
    siblingRange = 0;
    size = "mini";
  } else if (appState.isScreenWidthIn(0, 425 + 1)) {
    siblingRange = 1;
    size = "mini";
  } else if (appState.isScreenWidthIn(426, 540)) {
    siblingRange = 1;
    size = "small";
  } else if (appState.isScreenWidthIn(540, 640)) {
    siblingRange = 2;
    size = "small";
  } else if (appState.isScreenWidthIn(640, 768)) {
    siblingRange = 3;
    size = "small";
  } else if (appState.isScreenWidthIn(768, 880)) {
    siblingRange = 4;
    size = "small";
  } else if (appState.isScreenWidthIn(880, 1024)) {
    siblingRange = 5;
    size = null;
  } else {
    siblingRange = 6;
    size = null;
  }

  return (
    <UIPagination
      className={style.pagination}
      activePage={props.currentPage}
      size={size}
      siblingRange={siblingRange}
      ellipsisItem={{ content: "...", disabled: true, icon: true }}
      firstItem={null}
      lastItem={null}
      prevItem={{ content: <Icon name="chevron left" />, icon: true, disabled: props.currentPage === 1 }}
      nextItem={{ content: <Icon name="chevron right" />, icon: true, disabled: props.currentPage === totalPages }}
      totalPages={totalPages}
      onPageChange={(e, { activePage }) => {
        e.preventDefault();
        props.onPageChange(parseInt(activePage.toString()));
      }}
    />
  );
};

export default observer(Pagination);

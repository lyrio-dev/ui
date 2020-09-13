import React from "react";
import { Pagination as UIPagination, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./Pagination.module.less";
import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";

interface PaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

let Pagination: React.FC<PaginationProps> = props => {
  const totalPages = Math.ceil(props.totalCount / props.itemsPerPage);

  const screenWidthLessThan376 = useScreenWidthWithin(0, 376);
  const screenWidthLessThan426 = useScreenWidthWithin(0, 426);
  const screenWidthLessThan540 = useScreenWidthWithin(0, 540);
  const screenWidthLessThan640 = useScreenWidthWithin(0, 640);
  const screenWidthLessThan768 = useScreenWidthWithin(0, 768);
  const screenWidthLessThan880 = useScreenWidthWithin(0, 880);
  const screenWidthLessThan1024 = useScreenWidthWithin(0, 1024);

  let siblingRange: number, size: string;
  if (screenWidthLessThan376) {
    siblingRange = 0;
    size = "mini";
  } else if (screenWidthLessThan426) {
    siblingRange = 1;
    size = "mini";
  } else if (screenWidthLessThan540) {
    siblingRange = 1;
    size = "small";
  } else if (screenWidthLessThan640) {
    siblingRange = 2;
    size = "small";
  } else if (screenWidthLessThan768) {
    siblingRange = 3;
    size = "small";
  } else if (screenWidthLessThan880) {
    siblingRange = 4;
    size = "small";
  } else if (screenWidthLessThan1024) {
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

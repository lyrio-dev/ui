import React from "react";
import { Pagination as UIPagination, Icon } from "semantic-ui-react";

import style from "./Pagination.module.less";

interface PaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = props => {
  const totalPages = Math.ceil(props.totalCount / props.itemsPerPage);

  return (
    <UIPagination
      className={style.pagination}
      activePage={props.currentPage}
      siblingRange={6}
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

export default Pagination;

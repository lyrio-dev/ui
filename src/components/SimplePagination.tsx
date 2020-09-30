import React from "react";
import { Pagination, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./SimplePagination.module.less";

interface SimplePaginationProps {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (direction: -1 | 1) => void;
}

let SimplePagination: React.FC<SimplePaginationProps> = props => {
  return (
    <div className={style.wrapper}>
      <Pagination
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

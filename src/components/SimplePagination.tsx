import React from "react";
import { Pagination, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./SimplePagination.module.less";

import { useScreenWidthWithin } from "@/utils/hooks/useScreenWidthWithin";

interface SimplePaginationProps {
  hasPrevPage: boolean;
  hasNextPage: boolean;
  onPageChange: (direction: -1 | 1) => void;
}

let SimplePagination: React.FC<SimplePaginationProps> = props => {
  const screenWidthLessThan880 = useScreenWidthWithin(0, 880);

  let size: string;
  if (screenWidthLessThan880) size = "small";
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

import React from "react";
import { Pagination as UIPagination, PaginationProps as UIPaginationProps, Icon } from "semantic-ui-react";
import { observer } from "mobx-react";
import { URLDescriptor } from "navi";

import style from "./Pagination.module.less";
import { Link, useScreenWidthWithin } from "@/utils/hooks";

interface PatchedUIPaginationProps extends UIPaginationProps {
  pageUrl: (newPage: number) => Partial<URLDescriptor>;
}

class PatchedUIPagination extends UIPagination {
  constructor(props: PatchedUIPaginationProps) {
    super(props);

    const originalHandleItemOverrides: Function = this["handleItemOverrides"];
    this["handleItemOverrides"] = (active: boolean, type: string, value: number) => {
      const originalOverrider = originalHandleItemOverrides(active, type, value);
      const isEllipsisItem = type === "ellipsisItem";
      return (predefinedProps: unknown) => ({
        ...originalOverrider(predefinedProps),
        as: isEllipsisItem ? "span" : Link,
        href: isEllipsisItem ? undefined : props.pageUrl(value),
        onClick: undefined
      });
    };
  }
}

interface PaginationProps {
  totalCount: number;
  itemsPerPage: number;
  currentPage: number;
  pageUrl: (newPage: number) => Partial<URLDescriptor>;
}

export const Pagination: React.FC<PaginationProps> = observer(props => {
  const totalPages = Math.ceil(props.totalCount / props.itemsPerPage);

  const screenWidthLessThan376 = useScreenWidthWithin(0, 376);
  const screenWidthLessThan425 = useScreenWidthWithin(0, 425);
  const screenWidthLessThan540 = useScreenWidthWithin(0, 540);
  const screenWidthLessThan640 = useScreenWidthWithin(0, 640);
  const screenWidthLessThan768 = useScreenWidthWithin(0, 768);
  const screenWidthLessThan880 = useScreenWidthWithin(0, 880);
  const screenWidthLessThan1024 = useScreenWidthWithin(0, 1024);

  let siblingRange: number, size: string;
  if (screenWidthLessThan376) {
    siblingRange = 0;
    size = "small";
  } else if (screenWidthLessThan425) {
    siblingRange = 0;
  } else if (screenWidthLessThan540) {
    siblingRange = 1;
  } else if (screenWidthLessThan640) {
    siblingRange = 2;
  } else if (screenWidthLessThan768) {
    siblingRange = 3;
  } else if (screenWidthLessThan880) {
    siblingRange = 4;
  } else if (screenWidthLessThan1024) {
    siblingRange = 5;
  } else {
    siblingRange = 6;
  }

  const element = (
    <PatchedUIPagination
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
      pageUrl={props.pageUrl}
    />
  );

  return element;
});

interface SimplePaginationProps {
  className?: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  pageUrl: (direction: -1 | 1) => Partial<URLDescriptor>;
}

export const SimplePagination: React.FC<SimplePaginationProps> = observer(props => {
  return (
    <div className={style.wrapper + (props.className ? " " + props.className : "")}>
      <PatchedUIPagination
        className={style.pagination + " " + style.simple}
        activePage={2}
        siblingRange={0}
        firstItem={null}
        lastItem={null}
        prevItem={{ content: <Icon name="chevron left" />, icon: true, disabled: !props.hasPrevPage }}
        nextItem={{ content: <Icon name="chevron right" />, icon: true, disabled: !props.hasNextPage }}
        totalPages={3}
        pageUrl={(page: unknown) => props.pageUrl((Number(page) - 2) as 1 | -1)}
      />
    </div>
  );
});

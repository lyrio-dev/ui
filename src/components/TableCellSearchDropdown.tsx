import React, { useRef, useState } from "react";
import { Dropdown } from "semantic-ui-react";
import { useDebouncedCallback } from "use-debounce";

import style from "./TableCellSearchDropdown.module.less";

interface ResultItem {
  key: React.ReactText;
  data: any;
  content: React.ReactNode;
}

interface TableCellSearchDropdownProps {
  placeholder: string;
  onSearch: (input: string) => Promise<ResultItem[]>;
  onSelect: (data: any) => void;
}

const TableCellSearchDropdown: React.FC<TableCellSearchDropdownProps> = props => {
  const [result, setResult] = useState<ResultItem[]>([]);

  // If the search result returns after the input changed, don't show the result
  const [pending, setPending] = useState(false);
  const refInput = useRef("");
  const onSearch = useDebouncedCallback(async (input: string) => {
    input = input.trim();
    if (!input) return;

    setPending(true);
    refInput.current = input;
    setResult(await props.onSearch(input));
    if (refInput.current !== input) {
      // Still pending
      return;
    }

    setPending(false);
  }, 500).callback;

  function onSelect(index: number) {
    props.onSelect(result[index].data);
    setResult([]);
  }

  return (
    <Dropdown
      className={style.dropdown}
      placeholder={props.placeholder}
      fluid
      value={null}
      onSearchChange={(e, { searchQuery }) => onSearch(searchQuery)}
      search={(_, query) =>
        result.map(({ key, content }, i) => ({
          key,
          value: i,
          text: <div className={style.resultItem}>{content}</div>
        }))
      }
      onChange={(e, { value }) => onSelect(value as number)}
      noResultsMessage={null}
      loading={pending}
    />
  );
};

export default TableCellSearchDropdown;

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
  noResultMessage: string;
  onSearch: (input: string) => Promise<ResultItem[]>;
  onSelect: (data: any) => void;
}

const TableCellSearchDropdown: React.FC<TableCellSearchDropdownProps> = props => {
  const [result, setResult] = useState<ResultItem[]>([]);
  const [noResult, setNoResult] = useState(false);

  // If the search result returns after the input changed, don't show the result
  const [pending, setPending] = useState(false);
  const refInput = useRef("");
  const onSearch = useDebouncedCallback(async (input: string) => {
    input = input.trim();

    setPending(true);
    refInput.current = input;

    if (!input) {
      setPending(false);
      return;
    }

    const results = await props.onSearch(input);

    if (refInput.current !== input) {
      // Still pending
      return;
    }

    setResult(results || []);
    if (!results || results.length === 0) setNoResult(true);
    setPending(false);
  }, 500);

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
      onSearchChange={(e, { searchQuery }) => {
        setPending(true);
        setNoResult(false);
        onSearch(searchQuery);
      }}
      search={(_, query) =>
        result.map(({ key, content }, i) => ({
          key,
          value: i,
          text: <div className={style.resultItem}>{content}</div>
        }))
      }
      onChange={(e, { value }) => onSelect(value as number)}
      noResultsMessage={noResult ? props.noResultMessage : null}
      loading={pending}
    />
  );
};

export default TableCellSearchDropdown;

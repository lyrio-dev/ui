import React, { useState, useRef, PropsWithChildren } from "react";
import { Search } from "semantic-ui-react";
import { useDebouncedCallback } from "use-debounce";

import style from "./PreviewSearch.module.less";

import { useNavigationChecked, useScreenWidthWithin } from "@/utils/hooks";
import { onEnterPress } from "@/utils/onEnterPress";

interface PreviewSearchProps<T> {
  className?: string;
  placeholder: string;
  noResultsMessage: string;
  onGetResultKey: (result: T) => React.Key;
  onSearch: (input: string) => Promise<T[]>;
  onRenderResult: (result: T) => React.ReactNode;
  onResultSelect: (item: T) => void;
  onEnterPress?: (searchKeyword: string) => void;
}

const PreviewSearch = <T extends {}>(props: PropsWithChildren<PreviewSearchProps<T>>): React.ReactElement => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [results, setResults] = useState<T[]>([]);
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

    setResults(results || []);
    setHideResults(false);
    setPending(false);
  }, 500);

  const [hideResults, setHideResults] = useState(true);
  const navigation = useNavigationChecked();
  navigation.subscribe(route => route.type === "ready" && !hideResults && setHideResults(true));

  const isMobile = useScreenWidthWithin(0, 768);

  return (
    <Search
      className={style.search + (props.className ? " " + props.className : "")}
      placeholder={props.placeholder}
      value={searchKeyword}
      noResultsMessage={props.noResultsMessage}
      onSearchChange={(e, { value }) => {
        setSearchKeyword(value);
        setPending(true);
        onSearch(value);
      }}
      input={{ iconPosition: "left", fluid: isMobile }}
      // Workaround Semantic UI's buggy "custom result renderer"
      results={
        hideResults
          ? []
          : results.map(result => ({
              key: props.onGetResultKey(result),
              title: "",
              data: result
            }))
      }
      loading={pending}
      showNoResults={!pending && !hideResults}
      resultRenderer={(result: any) => props.onRenderResult(result.data) as any}
      onResultSelect={(e, { result }: { result: any }) => props.onResultSelect(result.data)}
      onKeyPress={onEnterPress(() => searchKeyword && props.onEnterPress && props.onEnterPress(searchKeyword))}
    />
  );
};

export default PreviewSearch;

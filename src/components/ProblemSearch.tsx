import React from "react";

// import style from "./ProblemSearch.module.less";

import { ProblemApi } from "@/api";
import { useLocalizer } from "@/utils/hooks";
import toast from "@/utils/toast";
import PreviewSearch from "./PreviewSearch";
import { getProblemDisplayName } from "@/pages/problem/utils";
import { appState } from "@/appState";
import { EmojiRenderer } from "./EmojiRenderer";

interface ProblemSearchProps {
  className?: string;
  placeholder?: string;
  queryParameters: Omit<ApiTypes.QueryProblemSetRequestDto, "keyword" | "titleOnly" | "skipCount" | "takeCount">;
  onResultSelect: (problem: ApiTypes.QueryProblemSetResponseItemDto) => void;
  onEnterPress?: (searchKeyword: string) => void;
}

const SEARCH_PROBLEM_PREVIEW_LIST_LENGTH = appState.serverPreference.pagination.searchProblemsPreview;

let ProblemSearch: React.FC<ProblemSearchProps> = props => {
  const _ = useLocalizer("components.problem_search");

  return (
    <PreviewSearch
      className={props.className}
      placeholder={props.placeholder || _(".placeholder")}
      noResultsMessage={_(".no_result")}
      onGetResultKey={result => result.meta.id}
      onSearch={async input => {
        const wildcardStart = input.startsWith("*");
        if (wildcardStart) input = input.substr(1);
        if (!input) return [];

        const { requestError, response } = await ProblemApi.queryProblemSet(
          Object.assign({}, props.queryParameters, {
            keyword: input,
            titleOnly: true,
            skipCount: 0,
            takeCount: SEARCH_PROBLEM_PREVIEW_LIST_LENGTH
          })
        );

        if (requestError) toast.error(requestError(_));
        else return response.result;

        return [];
      }}
      onRenderResult={result => (
        <EmojiRenderer>
          <div className="title">{getProblemDisplayName(result.meta, result.title, _)}</div>
        </EmojiRenderer>
      )}
      onResultSelect={props.onResultSelect}
      onEnterPress={props.onEnterPress}
    />
  );
};

export default ProblemSearch;

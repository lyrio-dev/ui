import React from "react";
import { observer } from "mobx-react";

import api from "@/api";
import { appState } from "@/appState";
import { getDiscussionDisplayTitle } from "@/pages/discussion/utils";
import { useLocalizer } from "@/utils/hooks";
import toast from "@/utils/toast";
import { EmojiRenderer } from "./EmojiRenderer";
import PreviewSearch from "./PreviewSearch";

interface DiscussionSearchProps {
  className?: string;
  queryParameters?: Omit<
    ApiTypes.QueryDiscussionsRequestDto,
    "locale" | "keyword" | "titleOnly" | "skipCount" | "takeCount"
  >;
  onResultSelect: (discussion: ApiTypes.QueryDiscussionsResponseDiscussionDto) => void;
  onEnterPress?: (searchKeyword: string) => void;
}

const SEARCH_DISCUSSION_PREVIEW_LIST_LENGTH = appState.serverPreference.pagination.searchDiscussionsPreview;

export let DiscussionSearch: React.FC<DiscussionSearchProps> = props => {
  const _ = useLocalizer("discussions.search_discussion");

  return (
    <PreviewSearch
      className={props.className}
      placeholder={_(".placeholder")}
      noResultsMessage={_(".no_result")}
      onGetResultKey={result => result.meta.id}
      onSearch={async input => {
        if (!input) return [];

        const { requestError, response } = await api.discussion.queryDiscussions(
          Object.assign({ locale: appState.locale }, props.queryParameters, {
            keyword: input,
            titleOnly: true,
            skipCount: 0,
            takeCount: SEARCH_DISCUSSION_PREVIEW_LIST_LENGTH
          })
        );

        if (requestError) toast.error(requestError(_));
        else return response.discussions;

        return [];
      }}
      onRenderResult={result => (
        <EmojiRenderer>
          <div className="title">{getDiscussionDisplayTitle(result.meta.title, _)}</div>
        </EmojiRenderer>
      )}
      onResultSelect={props.onResultSelect}
      onEnterPress={props.onEnterPress}
    />
  );
};

DiscussionSearch = observer(DiscussionSearch);

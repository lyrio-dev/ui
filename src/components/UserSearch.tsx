import React from "react";

import style from "./UserSearch.module.less";

import { UserApi } from "@/api";
import { useLocalizer } from "@/utils/hooks";
import toast from "@/utils/toast";
import UserAvatar from "./UserAvatar";
import PreviewSearch from "./PreviewSearch";

interface UserSearchProps {
  className?: string;
  placeholder?: string;
  onResultSelect: (user: ApiTypes.UserMetaDto) => void;
}

let UserSearch: React.FC<UserSearchProps> = props => {
  const _ = useLocalizer("components.user_search");

  return (
    <PreviewSearch
      className={props.className}
      placeholder={props.placeholder || _(".placeholder")}
      noResultsMessage={_(".no_result")}
      onGetResultKey={result => result.id}
      onSearch={async input => {
        const wildcardStart = input.startsWith("*");
        if (wildcardStart) input = input.substr(1);
        if (!input) return [];

        const { requestError, response } = await UserApi.searchUser({
          query: input,
          wildcard: wildcardStart ? "Both" : "End"
        });

        if (requestError) toast.error(requestError(_));
        else return response.userMetas;

        return [];
      }}
      onRenderResult={result => (
        <div className={style.result}>
          <UserAvatar className={style.avatar} userAvatar={result.avatar} imageSize={27.5} rounded />
          <div className={style.username}>{result.username}</div>
        </div>
      )}
      onResultSelect={props.onResultSelect}
    />
  );
};

export default UserSearch;

import React, { useState, useRef } from "react";
import { Search, Image } from "semantic-ui-react";
import { observer } from "mobx-react";

import style from "./UserSearch.module.less";

import { UserApi } from "@/api";
import { useIntlMessage } from "@/utils/hooks";
import toast from "@/utils/toast";
import { useDebouncedCallback } from "use-debounce/lib";
import getUserAvatar from "@/utils/getUserAvatar";
import { appState } from "@/appState";

interface UserSearchProps {
  className?: string;
  onResultSelect: (user: ApiTypes.UserMetaDto) => void;
}

let UserSearch: React.FC<UserSearchProps> = props => {
  const _ = useIntlMessage();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [result, setResult] = useState<ApiTypes.UserMetaDto[]>([]);
  const [pending, setPending] = useState(false);
  const refInput = useRef("");
  const [onSearch] = useDebouncedCallback(async (input: string) => {
    input = input.trim();
    if (!input) return;
    const wildcardStart = input.startsWith("*");
    if (wildcardStart) input = input.substr(1);
    if (!input) return;

    refInput.current = input;

    const { requestError, response } = await UserApi.searchUser({
      query: input,
      wildcard: wildcardStart ? "BOTH" : "END"
    });

    if (refInput.current !== input) return;

    if (requestError) toast.error(requestError);
    else {
      setResult(response.userMetas);
    }

    setPending(false);
  }, 500);

  const isMobile = appState.isScreenWidthIn(0, 768);

  return (
    <Search
      className={style.search + (props.className ? " " + props.className : "")}
      placeholder={_("components.user_search.placeholder")}
      value={searchKeyword}
      noResultsMessage={_("components.user_search.no_result")}
      onSearchChange={(e, { value }) => {
        setSearchKeyword(value);
        setPending(true);
        onSearch(value);
      }}
      input={{ iconPosition: "left", fluid: isMobile }}
      // Workaround Semantic UI's buggy "custom result renderer"
      results={result.map(user => ({
        key: user.id,
        title: "",
        "data-user": user
      }))}
      loading={pending}
      showNoResults={!pending}
      resultRenderer={(result: any) => (
        <div className={style.result}>
          <Image className={style.avatar} src={getUserAvatar(result["data-user"])} rounded size="tiny" />
          <div className={style.username}>{result["data-user"].username}</div>
        </div>
      )}
      onResultSelect={(e, { result }: { result: { "data-user": ApiTypes.UserMetaDto } }) =>
        props.onResultSelect(result["data-user"])
      }
    />
  );
};

export default observer(UserSearch);

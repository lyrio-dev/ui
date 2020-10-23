import React, { useEffect, useState } from "react";
import { Header } from "semantic-ui-react";
import { useNavigation } from "react-navi";

import style from "./DiscussionEditPage.module.less";

import { defineRoute, RouteError } from "@/AppRouter";
import api from "@/api";
import { appState } from "@/appState";
import { useLocalizer } from "@/utils/hooks";
import { DiscussionEditor } from "../view/DiscussionViewPage";
import { getBreadcrumb } from "../discussions/DiscussionsPage";
import toast from "@/utils/toast";
import { makeToBeLocalizedText } from "@/locales";

interface DiscussionEditPageProps {
  problem?: {
    meta: ApiTypes.ProblemMetaDto;
    title: string;
  };
  discussion?: ApiTypes.DiscussionDto;
}

const DiscussionEditPage: React.FC<DiscussionEditPageProps> = props => {
  const _ = useLocalizer("discussion_edit");
  const navigation = useNavigation();

  useEffect(() => {
    appState.enterNewPage(props.discussion ? `${_(".title_update")} #${props.discussion.meta.id}` : _(".title_new"));
  });

  const [title, setTitle] = useState(props.discussion ? props.discussion.meta.title : "");
  const [content, setContent] = useState(props.discussion ? props.discussion.content : "");

  async function onSubmit() {
    const { requestError, response } = props.discussion
      ? await api.discussion.updateDiscussion({
          discussionId: props.discussion.meta.id,
          title,
          content
        })
      : await api.discussion.createDiscussion({
          problemId: props.problem?.meta?.id,
          title,
          content
        });

    if (requestError) toast.error(requestError(_));
    else if (response.error) toast.error(_(`.errors.${response.error}`));
    else {
      const newId = props.discussion
        ? props.discussion.meta.id
        : (response as ApiTypes.CreateDiscussionResponseDto).discussionId;
      navigation.navigate(`/discussion/${newId}`);
      return true;
    }

    return false;
  }

  return (
    <>
      {getBreadcrumb(props.problem, _)}
      <Header className={style.header} size="large" content={_(props.discussion ? ".header.update" : ".header.add")} />
      <DiscussionEditor
        type={props.discussion ? "UpdateDiscussion" : "NewDiscussion"}
        publisher={props.discussion?.publisher || appState.currentUser}
        title={title}
        content={content}
        onChangeTitle={title => title.length <= 80 && setTitle(title)}
        onChangeContent={setContent}
        onCancel={() => navigation.navigate(`/discussion/${props.discussion.meta.id}`)}
        onSubmit={onSubmit}
        noSubmitPermission={props.discussion && !props.discussion.permissions.includes("Modify")}
      />
    </>
  );
};

export default {
  new: defineRoute(async request => {
    if (
      !(
        (appState.currentUser && appState.serverPreference.security.allowEveryoneCreateDiscussion) ||
        appState.currentUserHasPrivilege("ManageDiscussion")
      )
    ) {
      throw new RouteError(makeToBeLocalizedText(`discussion_edit.errors.PERMISSION_DENIED`));
    }

    const problem = await (async (): Promise<DiscussionEditPageProps["problem"]> => {
      const problemId = request.params.problemId;
      if (problemId == null) return null;

      const { requestError, response } = await api.problem.getProblem({
        id: Number(problemId) || 0,
        localizedContentsOfLocale: appState.locale,
        localizedContentsTitleOnly: true
      });

      if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
      else if (response.error) throw new RouteError(makeToBeLocalizedText(`discussion_edit.errors.${response.error}`));

      return {
        meta: response.meta,
        title: response.localizedContentsOfLocale.title
      };
    })();

    return <DiscussionEditPage problem={problem} />;
  }),
  edit: defineRoute(async request => {
    const { requestError, response } = await api.discussion.getDiscussionAndReplies({
      locale: appState.locale,
      discussionId: Number(request.params.id) || 0,
      getDiscussion: true
    });

    if (requestError) throw new RouteError(requestError, { showRefresh: true, showBack: true });
    else if (response.error) throw new RouteError(makeToBeLocalizedText(`discussion_edit.errors.${response.error}`));

    return <DiscussionEditPage discussion={response.discussion} />;
  })
};

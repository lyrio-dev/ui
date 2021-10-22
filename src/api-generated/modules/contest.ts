// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const createContest = createPostApi<ApiTypes.CreateContestRequestDto, ApiTypes.CreateContestResponseDto>(
  "contest/createContest",
  false
);
export const updateContest = createPostApi<ApiTypes.UpdateContestRequestDto, ApiTypes.UpdateContestResponseDto>(
  "contest/updateContest",
  false
);
export const deleteContest = createPostApi<ApiTypes.DeleteContestRequestDto, ApiTypes.DeleteContestResponseDto>(
  "contest/deleteContest",
  false
);
export const getContestAccessControlList = createPostApi<
  ApiTypes.GetContestAccessControlListRequestDto,
  ApiTypes.GetContestAccessControlListResponseDto
>("contest/getContestAccessControlList", false);
export const setContestAccessControlList = createPostApi<
  ApiTypes.SetContestAccessControlListRequestDto,
  ApiTypes.SetContestAccessControlListResponseDto
>("contest/setContestAccessControlList", false);
export const registerContest = createPostApi<ApiTypes.RegisterContestRequestDto, ApiTypes.RegisterContestResponseDto>(
  "contest/registerContest",
  false
);
export const queryContests = createPostApi<ApiTypes.QueryContestsRequestDto, ApiTypes.QueryContestsResponseDto>(
  "contest/queryContests",
  false
);
export const getContest = createPostApi<ApiTypes.GetContestRequestDto, ApiTypes.GetContestResponseDto>(
  "contest/getContest",
  false
);
export const getContestEditData = createPostApi<
  ApiTypes.GetContestEditDataRequestDto,
  ApiTypes.GetContestEditDataResponseDto
>("contest/getContestEditData", false);
export const createContestAnnouncement = createPostApi<
  ApiTypes.CreateContestAnnouncementRequestDto,
  ApiTypes.CreateContestAnnouncementResponseDto
>("contest/createContestAnnouncement", false);
export const createContestIssue = createPostApi<
  ApiTypes.CreateContestIssueRequestDto,
  ApiTypes.CreateContestIssueResponseDto
>("contest/createContestIssue", false);
export const replyContestIssue = createPostApi<
  ApiTypes.ReplyContestIssueRequestDto,
  ApiTypes.ReplyContestIssueResponseDto
>("contest/replyContestIssue", false);
export const deleteContestAnnouncement = createPostApi<
  ApiTypes.DeleteContestAnnouncementRequestDto,
  ApiTypes.DeleteContestAnnouncementResponseDto
>("contest/deleteContestAnnouncement", false);
export const deleteContestIssue = createPostApi<
  ApiTypes.DeleteContestIssueRequestDto,
  ApiTypes.DeleteContestIssueResponseDto
>("contest/deleteContestIssue", false);
export const queryRanklist = createPostApi<ApiTypes.QueryRanklistRequestDto, ApiTypes.QueryRanklistResponseDto>(
  "contest/queryRanklist",
  false
);
export const rejudgeContest = createPostApi<ApiTypes.RejudgeContestRequestDto, ApiTypes.RejudgeContestResponseDto>(
  "contest/rejudgeContest",
  false
);

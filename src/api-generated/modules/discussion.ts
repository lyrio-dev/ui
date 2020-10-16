// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type CreateDiscussionRequestDto = ApiTypes.CreateDiscussionRequestDto;
export type CreateDiscussionResponseDto = ApiTypes.CreateDiscussionResponseDto;
export type CreateDiscussionReplyRequestDto = ApiTypes.CreateDiscussionReplyRequestDto;
export type CreateDiscussionReplyResponseDto = ApiTypes.CreateDiscussionReplyResponseDto;
export type ToggleReactionRequestDto = ApiTypes.ToggleReactionRequestDto;
export type ToggleReactionResponseDto = ApiTypes.ToggleReactionResponseDto;
export type QueryDiscussionsRequestDto = ApiTypes.QueryDiscussionsRequestDto;
export type QueryDiscussionsResponseDto = ApiTypes.QueryDiscussionsResponseDto;
export type GetDiscussionPermissionsRequestDto = ApiTypes.GetDiscussionPermissionsRequestDto;
export type GetDiscussionPermissionsResponseDto = ApiTypes.GetDiscussionPermissionsResponseDto;
export type GetDiscussionAndRepliesRequestDto = ApiTypes.GetDiscussionAndRepliesRequestDto;
export type GetDiscussionAndRepliesResponseDto = ApiTypes.GetDiscussionAndRepliesResponseDto;
export type UpdateDiscussionRequestDto = ApiTypes.UpdateDiscussionRequestDto;
export type UpdateDiscussionResponseDto = ApiTypes.UpdateDiscussionResponseDto;
export type UpdateDiscussionReplyRequestDto = ApiTypes.UpdateDiscussionReplyRequestDto;
export type UpdateDiscussionReplyResponseDto = ApiTypes.UpdateDiscussionReplyResponseDto;
export type DeleteDiscussionRequestDto = ApiTypes.DeleteDiscussionRequestDto;
export type DeleteDiscussionResponseDto = ApiTypes.DeleteDiscussionResponseDto;
export type DeleteDiscussionReplyRequestDto = ApiTypes.DeleteDiscussionReplyRequestDto;
export type DeleteDiscussionReplyResponseDto = ApiTypes.DeleteDiscussionReplyResponseDto;
export type SetDiscussionPublicRequestDto = ApiTypes.SetDiscussionPublicRequestDto;
export type SetDiscussionPublicResponseDto = ApiTypes.SetDiscussionPublicResponseDto;
export type SetDiscussionReplyPublicRequestDto = ApiTypes.SetDiscussionReplyPublicRequestDto;
export type SetDiscussionReplyPublicResponseDto = ApiTypes.SetDiscussionReplyPublicResponseDto;
export type SetDiscussionPermissionsRequestDto = ApiTypes.SetDiscussionPermissionsRequestDto;
export type SetDiscussionPermissionsResponseDto = ApiTypes.SetDiscussionPermissionsResponseDto;

export const createDiscussion = createPostApi<CreateDiscussionRequestDto, CreateDiscussionResponseDto>(
  "discussion/createDiscussion"
);
export const createDiscussionReply = createPostApi<CreateDiscussionReplyRequestDto, CreateDiscussionReplyResponseDto>(
  "discussion/createDiscussionReply"
);
export const toggleReaction = createPostApi<ToggleReactionRequestDto, ToggleReactionResponseDto>(
  "discussion/toggleReaction"
);
export const queryDiscussions = createPostApi<QueryDiscussionsRequestDto, QueryDiscussionsResponseDto>(
  "discussion/queryDiscussion"
);
export const getDiscussionPermissions = createPostApi<
  GetDiscussionPermissionsRequestDto,
  GetDiscussionPermissionsResponseDto
>("discussion/getDiscussionPermissions");
export const getDiscussionAndReplies = createPostApi<
  GetDiscussionAndRepliesRequestDto,
  GetDiscussionAndRepliesResponseDto
>("discussion/getDiscussionAndReplies");
export const updateDiscussion = createPostApi<UpdateDiscussionRequestDto, UpdateDiscussionResponseDto>(
  "discussion/updateDiscussion"
);
export const updateDiscussionReply = createPostApi<UpdateDiscussionReplyRequestDto, UpdateDiscussionReplyResponseDto>(
  "discussion/updateDiscussionReply"
);
export const deleteDiscussion = createPostApi<DeleteDiscussionRequestDto, DeleteDiscussionResponseDto>(
  "discussion/deleteDiscussion"
);
export const deleteDiscussionReply = createPostApi<DeleteDiscussionReplyRequestDto, DeleteDiscussionReplyResponseDto>(
  "discussion/deleteDiscussionReply"
);
export const setDiscussionPublic = createPostApi<SetDiscussionPublicRequestDto, SetDiscussionPublicResponseDto>(
  "discussion/setDiscussionPublic"
);
export const setDiscussionReplyPublic = createPostApi<
  SetDiscussionReplyPublicRequestDto,
  SetDiscussionReplyPublicResponseDto
>("discussion/setDiscussionReplyPublic");
export const setDiscussionPermissions = createPostApi<
  SetDiscussionPermissionsRequestDto,
  SetDiscussionPermissionsResponseDto
>("discussion/setDiscussionPermissions");

// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const createDiscussion = createPostApi<
  ApiTypes.CreateDiscussionRequestDto,
  ApiTypes.CreateDiscussionResponseDto
>("discussion/createDiscussion");
export const createDiscussionReply = createPostApi<
  ApiTypes.CreateDiscussionReplyRequestDto,
  ApiTypes.CreateDiscussionReplyResponseDto
>("discussion/createDiscussionReply");
export const toggleReaction = createPostApi<ApiTypes.ToggleReactionRequestDto, ApiTypes.ToggleReactionResponseDto>(
  "discussion/toggleReaction"
);
export const queryDiscussions = createPostApi<
  ApiTypes.QueryDiscussionsRequestDto,
  ApiTypes.QueryDiscussionsResponseDto
>("discussion/queryDiscussion");
export const getDiscussionPermissions = createPostApi<
  ApiTypes.GetDiscussionPermissionsRequestDto,
  ApiTypes.GetDiscussionPermissionsResponseDto
>("discussion/getDiscussionPermissions");
export const getDiscussionAndReplies = createPostApi<
  ApiTypes.GetDiscussionAndRepliesRequestDto,
  ApiTypes.GetDiscussionAndRepliesResponseDto
>("discussion/getDiscussionAndReplies");
export const updateDiscussion = createPostApi<
  ApiTypes.UpdateDiscussionRequestDto,
  ApiTypes.UpdateDiscussionResponseDto
>("discussion/updateDiscussion");
export const updateDiscussionReply = createPostApi<
  ApiTypes.UpdateDiscussionReplyRequestDto,
  ApiTypes.UpdateDiscussionReplyResponseDto
>("discussion/updateDiscussionReply");
export const deleteDiscussion = createPostApi<
  ApiTypes.DeleteDiscussionRequestDto,
  ApiTypes.DeleteDiscussionResponseDto
>("discussion/deleteDiscussion");
export const deleteDiscussionReply = createPostApi<
  ApiTypes.DeleteDiscussionReplyRequestDto,
  ApiTypes.DeleteDiscussionReplyResponseDto
>("discussion/deleteDiscussionReply");
export const setDiscussionPublic = createPostApi<
  ApiTypes.SetDiscussionPublicRequestDto,
  ApiTypes.SetDiscussionPublicResponseDto
>("discussion/setDiscussionPublic");
export const setDiscussionReplyPublic = createPostApi<
  ApiTypes.SetDiscussionReplyPublicRequestDto,
  ApiTypes.SetDiscussionReplyPublicResponseDto
>("discussion/setDiscussionReplyPublic");
export const setDiscussionPermissions = createPostApi<
  ApiTypes.SetDiscussionPermissionsRequestDto,
  ApiTypes.SetDiscussionPermissionsResponseDto
>("discussion/setDiscussionPermissions");

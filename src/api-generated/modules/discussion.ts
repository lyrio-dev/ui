// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const createDiscussion = createPostApi<
  ApiTypes.CreateDiscussionRequestDto,
  ApiTypes.CreateDiscussionResponseDto
>("discussion/createDiscussion", true);
export const createDiscussionReply = createPostApi<
  ApiTypes.CreateDiscussionReplyRequestDto,
  ApiTypes.CreateDiscussionReplyResponseDto
>("discussion/createDiscussionReply", true);
export const toggleReaction = createPostApi<ApiTypes.ToggleReactionRequestDto, ApiTypes.ToggleReactionResponseDto>(
  "discussion/toggleReaction",
  false
);
export const queryDiscussions = createPostApi<
  ApiTypes.QueryDiscussionsRequestDto,
  ApiTypes.QueryDiscussionsResponseDto
>("discussion/queryDiscussion", false);
export const getDiscussionPermissions = createPostApi<
  ApiTypes.GetDiscussionPermissionsRequestDto,
  ApiTypes.GetDiscussionPermissionsResponseDto
>("discussion/getDiscussionPermissions", false);
export const getDiscussionAndReplies = createPostApi<
  ApiTypes.GetDiscussionAndRepliesRequestDto,
  ApiTypes.GetDiscussionAndRepliesResponseDto
>("discussion/getDiscussionAndReplies", false);
export const updateDiscussion = createPostApi<
  ApiTypes.UpdateDiscussionRequestDto,
  ApiTypes.UpdateDiscussionResponseDto
>("discussion/updateDiscussion", false);
export const updateDiscussionReply = createPostApi<
  ApiTypes.UpdateDiscussionReplyRequestDto,
  ApiTypes.UpdateDiscussionReplyResponseDto
>("discussion/updateDiscussionReply", false);
export const deleteDiscussion = createPostApi<
  ApiTypes.DeleteDiscussionRequestDto,
  ApiTypes.DeleteDiscussionResponseDto
>("discussion/deleteDiscussion", false);
export const deleteDiscussionReply = createPostApi<
  ApiTypes.DeleteDiscussionReplyRequestDto,
  ApiTypes.DeleteDiscussionReplyResponseDto
>("discussion/deleteDiscussionReply", false);
export const setDiscussionPublic = createPostApi<
  ApiTypes.SetDiscussionPublicRequestDto,
  ApiTypes.SetDiscussionPublicResponseDto
>("discussion/setDiscussionPublic", false);
export const setDiscussionReplyPublic = createPostApi<
  ApiTypes.SetDiscussionReplyPublicRequestDto,
  ApiTypes.SetDiscussionReplyPublicResponseDto
>("discussion/setDiscussionReplyPublic", false);
export const setDiscussionPermissions = createPostApi<
  ApiTypes.SetDiscussionPermissionsRequestDto,
  ApiTypes.SetDiscussionPermissionsResponseDto
>("discussion/setDiscussionPermissions", false);

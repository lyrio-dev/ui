// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const searchUser = createGetApi<{ query: string; wildcard?: string }, ApiTypes.SearchUserResponseDto>(
  "user/searchUser"
);
export const getUserMeta = createPostApi<ApiTypes.GetUserMetaRequestDto, ApiTypes.GetUserMetaResponseDto>(
  "user/getUserMeta",
  false
);
export const setUserPrivileges = createPostApi<
  ApiTypes.SetUserPrivilegesRequestDto,
  ApiTypes.SetUserPrivilegesResponseDto
>("user/setUserPrivileges", false);
export const updateUserProfile = createPostApi<
  ApiTypes.UpdateUserProfileRequestDto,
  ApiTypes.UpdateUserProfileResponseDto
>("user/updateUserProfile", false);
export const getUserList = createPostApi<ApiTypes.GetUserListRequestDto, ApiTypes.GetUserListResponseDto>(
  "user/getUserList",
  false
);
export const getUserDetail = createPostApi<ApiTypes.GetUserDetailRequestDto, ApiTypes.GetUserDetailResponseDto>(
  "user/getUserDetail",
  false
);
export const getUserProfile = createPostApi<ApiTypes.GetUserProfileRequestDto, ApiTypes.GetUserProfileResponseDto>(
  "user/getUserProfile",
  false
);
export const getUserPreference = createPostApi<
  ApiTypes.GetUserPreferenceRequestDto,
  ApiTypes.GetUserPreferenceResponseDto
>("user/getUserPreference", false);
export const updateUserPreference = createPostApi<
  ApiTypes.UpdateUserPreferenceRequestDto,
  ApiTypes.UpdateUserPreferenceResponseDto
>("user/updateUserPreference", false);
export const getUserSecuritySettings = createPostApi<
  ApiTypes.GetUserSecuritySettingsRequestDto,
  ApiTypes.GetUserSecuritySettingsResponseDto
>("user/getUserSecuritySettings", false);
export const queryAuditLogs = createPostApi<ApiTypes.QueryAuditLogsRequestDto, ApiTypes.QueryAuditLogsResponseDto>(
  "user/queryAuditLogs",
  false
);
export const updateUserPassword = createPostApi<
  ApiTypes.UpdateUserPasswordRequestDto,
  ApiTypes.UpdateUserPasswordResponseDto
>("user/updateUserPassword", false);
export const updateUserSelfEmail = createPostApi<
  ApiTypes.UpdateUserSelfEmailRequestDto,
  ApiTypes.UpdateUserSelfEmailResponseDto
>("user/updateUserSelfEmail", false);

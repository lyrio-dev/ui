// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const searchUser = createGetApi<{ query: string; wildcard?: string }, ApiTypes.SearchUserResponseDto>(
  "user/searchUser"
);
export const getUserMeta = createPostApi<ApiTypes.GetUserMetaRequestDto, ApiTypes.GetUserMetaResponseDto>(
  "user/getUserMeta"
);
export const setUserPrivileges = createPostApi<
  ApiTypes.SetUserPrivilegesRequestDto,
  ApiTypes.SetUserPrivilegesResponseDto
>("user/setUserPrivileges");
export const updateUserProfile = createPostApi<
  ApiTypes.UpdateUserProfileRequestDto,
  ApiTypes.UpdateUserProfileResponseDto
>("user/updateUserProfile");
export const getUserList = createPostApi<ApiTypes.GetUserListRequestDto, ApiTypes.GetUserListResponseDto>(
  "user/getUserList"
);
export const getUserDetail = createPostApi<ApiTypes.GetUserDetailRequestDto, ApiTypes.GetUserDetailResponseDto>(
  "user/getUserDetail"
);
export const getUserProfile = createPostApi<ApiTypes.GetUserProfileRequestDto, ApiTypes.GetUserProfileResponseDto>(
  "user/getUserProfile"
);
export const getUserPreference = createPostApi<
  ApiTypes.GetUserPreferenceRequestDto,
  ApiTypes.GetUserPreferenceResponseDto
>("user/getUserPreference");
export const updateUserPreference = createPostApi<
  ApiTypes.UpdateUserPreferenceRequestDto,
  ApiTypes.UpdateUserPreferenceResponseDto
>("user/updateUserPreference");
export const getUserSecuritySettings = createPostApi<
  ApiTypes.GetUserSecuritySettingsRequestDto,
  ApiTypes.GetUserSecuritySettingsResponseDto
>("user/getUserSecuritySettings");
export const queryAuditLogs = createPostApi<ApiTypes.QueryAuditLogsRequestDto, ApiTypes.QueryAuditLogsResponseDto>(
  "user/queryAuditLogs"
);
export const updateUserPassword = createPostApi<
  ApiTypes.UpdateUserPasswordRequestDto,
  ApiTypes.UpdateUserPasswordResponseDto
>("user/updateUserPassword");
export const updateUserSelfEmail = createPostApi<
  ApiTypes.UpdateUserSelfEmailRequestDto,
  ApiTypes.UpdateUserSelfEmailResponseDto
>("user/updateUserSelfEmail");

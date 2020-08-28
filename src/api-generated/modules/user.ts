// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type SearchUserResponseDto = ApiTypes.SearchUserResponseDto;
export type GetUserMetaRequestDto = ApiTypes.GetUserMetaRequestDto;
export type GetUserMetaResponseDto = ApiTypes.GetUserMetaResponseDto;
export type SetUserPrivilegesRequestDto = ApiTypes.SetUserPrivilegesRequestDto;
export type SetUserPrivilegesResponseDto = ApiTypes.SetUserPrivilegesResponseDto;
export type UpdateUserProfileRequestDto = ApiTypes.UpdateUserProfileRequestDto;
export type UpdateUserProfileResponseDto = ApiTypes.UpdateUserProfileResponseDto;
export type GetUserListRequestDto = ApiTypes.GetUserListRequestDto;
export type GetUserListResponseDto = ApiTypes.GetUserListResponseDto;
export type GetUserDetailRequestDto = ApiTypes.GetUserDetailRequestDto;
export type GetUserDetailResponseDto = ApiTypes.GetUserDetailResponseDto;
export type GetUserProfileRequestDto = ApiTypes.GetUserProfileRequestDto;
export type GetUserProfileResponseDto = ApiTypes.GetUserProfileResponseDto;
export type GetUserPreferenceRequestDto = ApiTypes.GetUserPreferenceRequestDto;
export type GetUserPreferenceResponseDto = ApiTypes.GetUserPreferenceResponseDto;
export type UpdateUserPreferenceRequestDto = ApiTypes.UpdateUserPreferenceRequestDto;
export type UpdateUserPreferenceResponseDto = ApiTypes.UpdateUserPreferenceResponseDto;
export type GetUserSecuritySettingsRequestDto = ApiTypes.GetUserSecuritySettingsRequestDto;
export type GetUserSecuritySettingsResponseDto = ApiTypes.GetUserSecuritySettingsResponseDto;
export type UpdateUserPasswordRequestDto = ApiTypes.UpdateUserPasswordRequestDto;
export type UpdateUserPasswordResponseDto = ApiTypes.UpdateUserPasswordResponseDto;
export type UpdateUserSelfEmailRequestDto = ApiTypes.UpdateUserSelfEmailRequestDto;
export type UpdateUserSelfEmailResponseDto = ApiTypes.UpdateUserSelfEmailResponseDto;

export const searchUser = createGetApi<{ query: string; wildcard?: string }, SearchUserResponseDto>("user/searchUser");
export const getUserMeta = createPostApi<GetUserMetaRequestDto, GetUserMetaResponseDto>("user/getUserMeta");
export const setUserPrivileges = createPostApi<SetUserPrivilegesRequestDto, SetUserPrivilegesResponseDto>(
  "user/setUserPrivileges"
);
export const updateUserProfile = createPostApi<UpdateUserProfileRequestDto, UpdateUserProfileResponseDto>(
  "user/updateUserProfile"
);
export const getUserList = createPostApi<GetUserListRequestDto, GetUserListResponseDto>("user/getUserList");
export const getUserDetail = createPostApi<GetUserDetailRequestDto, GetUserDetailResponseDto>("user/getUserDetail");
export const getUserProfile = createPostApi<GetUserProfileRequestDto, GetUserProfileResponseDto>("user/getUserProfile");
export const getUserPreference = createPostApi<GetUserPreferenceRequestDto, GetUserPreferenceResponseDto>(
  "user/getUserPreference"
);
export const updateUserPreference = createPostApi<UpdateUserPreferenceRequestDto, UpdateUserPreferenceResponseDto>(
  "user/updateUserPreference"
);
export const getUserSecuritySettings = createPostApi<
  GetUserSecuritySettingsRequestDto,
  GetUserSecuritySettingsResponseDto
>("user/getUserSecuritySettings");
export const updateUserPassword = createPostApi<UpdateUserPasswordRequestDto, UpdateUserPasswordResponseDto>(
  "user/updateUserPassword"
);
export const updateUserSelfEmail = createPostApi<UpdateUserSelfEmailRequestDto, UpdateUserSelfEmailResponseDto>(
  "user/updateUserSelfEmail"
);

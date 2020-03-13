// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type SearchUserResponseDto = ApiTypes.SearchUserResponseDto;
export type GetUserMetaResponseDto = ApiTypes.GetUserMetaResponseDto;
export type SetUserPrivilegesRequestDto = ApiTypes.SetUserPrivilegesRequestDto;
export type SetUserPrivilegesResponseDto = ApiTypes.SetUserPrivilegesResponseDto;
export type UpdateUserProfileRequestDto = ApiTypes.UpdateUserProfileRequestDto;
export type UpdateUserProfileResponseDto = ApiTypes.UpdateUserProfileResponseDto;
export type GetUserListRequestDto = ApiTypes.GetUserListRequestDto;
export type GetUserListResponseDto = ApiTypes.GetUserListResponseDto;

export const searchUser = createGetApi<{ query: string; wildcard?: string }, SearchUserResponseDto>("user/searchUser");
export const getUserMeta = createGetApi<
  { userId?: string; username?: string; getPrivileges?: string },
  GetUserMetaResponseDto
>("user/getUserMeta");
export const setUserPrivileges = createPostApi<SetUserPrivilegesRequestDto, SetUserPrivilegesResponseDto>(
  "user/setUserPrivileges"
);
export const updateUserProfile = createPostApi<UpdateUserProfileRequestDto, UpdateUserProfileResponseDto>(
  "user/updateUserProfile"
);
export const getUserList = createPostApi<GetUserListRequestDto, GetUserListResponseDto>("user/getUserList");

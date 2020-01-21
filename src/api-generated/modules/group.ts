// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type GetGroupMetaResponseDto = ApiTypes.GetGroupMetaResponseDto;
export type CreateGroupRequestDto = ApiTypes.CreateGroupRequestDto;
export type CreateGroupResponseDto = ApiTypes.CreateGroupResponseDto;
export type DeleteGroupRequestDto = ApiTypes.DeleteGroupRequestDto;
export type DeleteGroupResponseDto = ApiTypes.DeleteGroupResponseDto;
export type AddUserToGroupRequestDto = ApiTypes.AddUserToGroupRequestDto;
export type AddUserToGroupResponseDto = ApiTypes.AddUserToGroupResponseDto;
export type RemoveUserFromGroupRequestDto = ApiTypes.RemoveUserFromGroupRequestDto;
export type RemoveUserFromGroupResponseDto = ApiTypes.RemoveUserFromGroupResponseDto;
export type SetGroupAdminRequestDto = ApiTypes.SetGroupAdminRequestDto;
export type SetGroupAdminResponseDto = ApiTypes.SetGroupAdminResponseDto;

export const getGroupMeta = createGetApi<{ groupId: string }, GetGroupMetaResponseDto>("group/getGroupMeta");
export const createGroup = createPostApi<CreateGroupRequestDto, CreateGroupResponseDto>("group/createGroup");
export const deleteGroup = createPostApi<DeleteGroupRequestDto, DeleteGroupResponseDto>("group/deleteGroup");
export const addMember = createPostApi<AddUserToGroupRequestDto, AddUserToGroupResponseDto>("group/addMember");
export const removeMember = createPostApi<RemoveUserFromGroupRequestDto, RemoveUserFromGroupResponseDto>("group/removeMember");
export const setGroupAdmin = createPostApi<SetGroupAdminRequestDto, SetGroupAdminResponseDto>("group/setGroupAdmin");

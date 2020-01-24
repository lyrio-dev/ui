// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type QueryProblemSetRequestDto = ApiTypes.QueryProblemSetRequestDto;
export type QueryProblemSetResponseDto = ApiTypes.QueryProblemSetResponseDto;
export type CreateProblemRequestDto = ApiTypes.CreateProblemRequestDto;
export type CreateProblemResponseDto = ApiTypes.CreateProblemResponseDto;
export type UpdateProblemStatementRequestDto = ApiTypes.UpdateProblemStatementRequestDto;
export type UpdateProblemStatementResponseDto = ApiTypes.UpdateProblemStatementResponseDto;
export type GetProblemStatementsAllLocalesResponseDto = ApiTypes.GetProblemStatementsAllLocalesResponseDto;
export type GetProblemDetailResponseDto = ApiTypes.GetProblemDetailResponseDto;
export type SetProblemPermissionsRequestDto = ApiTypes.SetProblemPermissionsRequestDto;
export type SetProblemPermissionsResponseDto = ApiTypes.SetProblemPermissionsResponseDto;
export type GetProblemPermissionsResponseDto = ApiTypes.GetProblemPermissionsResponseDto;
export type SetProblemDisplayIdRequestDto = ApiTypes.SetProblemDisplayIdRequestDto;
export type SetProblemDisplayIdResponseDto = ApiTypes.SetProblemDisplayIdResponseDto;
export type SetProblemPublicRequestDto = ApiTypes.SetProblemPublicRequestDto;
export type SetProblemPublicResponseDto = ApiTypes.SetProblemPublicResponseDto;
export type AddProblemFileRequestDto = ApiTypes.AddProblemFileRequestDto;
export type AddProblemFileResponseDto = ApiTypes.AddProblemFileResponseDto;
export type RemoveProblemFilesRequestDto = ApiTypes.RemoveProblemFilesRequestDto;
export type RemoveProblemFilesResponseDto = ApiTypes.RemoveProblemFilesResponseDto;
export type ListProblemFilesRequestDto = ApiTypes.ListProblemFilesRequestDto;
export type ListProblemFilesResponseDto = ApiTypes.ListProblemFilesResponseDto;
export type DownloadProblemFilesRequestDto = ApiTypes.DownloadProblemFilesRequestDto;
export type DownloadProblemFilesResponseDto = ApiTypes.DownloadProblemFilesResponseDto;
export type GetProblemAllFilesAndPermissionResponseDto = ApiTypes.GetProblemAllFilesAndPermissionResponseDto;
export type RenameProblemFileRequestDto = ApiTypes.RenameProblemFileRequestDto;
export type RenameProblemFileResponseDto = ApiTypes.RenameProblemFileResponseDto;

export const queryProblemSet = createPostApi<QueryProblemSetRequestDto, QueryProblemSetResponseDto>(
  "problem/queryProblemSet"
);
export const createProblem = createPostApi<CreateProblemRequestDto, CreateProblemResponseDto>("problem/createProblem");
export const updateStatement = createPostApi<UpdateProblemStatementRequestDto, UpdateProblemStatementResponseDto>(
  "problem/updateStatement"
);
export const getProblemStatementsAllLocales = createGetApi<
  { id?: string; displayId?: string },
  GetProblemStatementsAllLocalesResponseDto
>("problem/getProblemStatementsAllLocales");
export const getProblemDetail = createGetApi<
  { id?: string; displayId?: string; locale: string },
  GetProblemDetailResponseDto
>("problem/getProblemDetail");
export const setProblemPermissions = createPostApi<SetProblemPermissionsRequestDto, SetProblemPermissionsResponseDto>(
  "problem/setProblemPermissions"
);
export const getProblemPermissions = createGetApi<
  { problemId: string; permissionType: string },
  GetProblemPermissionsResponseDto
>("problem/getProblemPermissions");
export const setProblemDisplayId = createPostApi<SetProblemDisplayIdRequestDto, SetProblemDisplayIdResponseDto>(
  "problem/setProblemDisplayId"
);
export const setProblemPublic = createPostApi<SetProblemPublicRequestDto, SetProblemPublicResponseDto>(
  "problem/setProblemPublic"
);
export const addProblemFile = createPostApi<AddProblemFileRequestDto, AddProblemFileResponseDto>(
  "problem/addProblemFile"
);
export const removeProblemFiles = createPostApi<RemoveProblemFilesRequestDto, RemoveProblemFilesResponseDto>(
  "problem/removeProblemFiles"
);
export const listProblemFiles = createPostApi<ListProblemFilesRequestDto, ListProblemFilesResponseDto>(
  "problem/listProblemFiles"
);
export const downloadProblemFiles = createPostApi<DownloadProblemFilesRequestDto, DownloadProblemFilesResponseDto>(
  "problem/downloadProblemFiles"
);
export const getProblemAllFilesAndPermission = createGetApi<
  { id?: string; displayId?: string },
  GetProblemAllFilesAndPermissionResponseDto
>("problem/getProblemAllFilesAndPermission");
export const renameProblemFile = createPostApi<RenameProblemFileRequestDto, RenameProblemFileResponseDto>(
  "problem/renameProblemFile"
);

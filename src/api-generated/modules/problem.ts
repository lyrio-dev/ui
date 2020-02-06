// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type QueryProblemSetRequestDto = ApiTypes.QueryProblemSetRequestDto;
export type QueryProblemSetResponseDto = ApiTypes.QueryProblemSetResponseDto;
export type CreateProblemRequestDto = ApiTypes.CreateProblemRequestDto;
export type CreateProblemResponseDto = ApiTypes.CreateProblemResponseDto;
export type UpdateProblemStatementRequestDto = ApiTypes.UpdateProblemStatementRequestDto;
export type UpdateProblemStatementResponseDto = ApiTypes.UpdateProblemStatementResponseDto;
export type GetProblemRequestDto = ApiTypes.GetProblemRequestDto;
export type GetProblemResponseDto = ApiTypes.GetProblemResponseDto;
export type SetProblemPermissionsRequestDto = ApiTypes.SetProblemPermissionsRequestDto;
export type SetProblemPermissionsResponseDto = ApiTypes.SetProblemPermissionsResponseDto;
export type SetProblemDisplayIdRequestDto = ApiTypes.SetProblemDisplayIdRequestDto;
export type SetProblemDisplayIdResponseDto = ApiTypes.SetProblemDisplayIdResponseDto;
export type SetProblemPublicRequestDto = ApiTypes.SetProblemPublicRequestDto;
export type SetProblemPublicResponseDto = ApiTypes.SetProblemPublicResponseDto;
export type AddProblemFileRequestDto = ApiTypes.AddProblemFileRequestDto;
export type AddProblemFileResponseDto = ApiTypes.AddProblemFileResponseDto;
export type RemoveProblemFilesRequestDto = ApiTypes.RemoveProblemFilesRequestDto;
export type RemoveProblemFilesResponseDto = ApiTypes.RemoveProblemFilesResponseDto;
export type DownloadProblemFilesRequestDto = ApiTypes.DownloadProblemFilesRequestDto;
export type DownloadProblemFilesResponseDto = ApiTypes.DownloadProblemFilesResponseDto;
export type RenameProblemFileRequestDto = ApiTypes.RenameProblemFileRequestDto;
export type RenameProblemFileResponseDto = ApiTypes.RenameProblemFileResponseDto;
export type UpdateProblemJudgeInfoRequestDto = ApiTypes.UpdateProblemJudgeInfoRequestDto;
export type UpdateProblemJudgeInfoResponseDto = ApiTypes.UpdateProblemJudgeInfoResponseDto;

export const queryProblemSet = createPostApi<QueryProblemSetRequestDto, QueryProblemSetResponseDto>(
  "problem/queryProblemSet"
);
export const createProblem = createPostApi<CreateProblemRequestDto, CreateProblemResponseDto>("problem/createProblem");
export const updateStatement = createPostApi<UpdateProblemStatementRequestDto, UpdateProblemStatementResponseDto>(
  "problem/updateStatement"
);
export const getProblem = createPostApi<GetProblemRequestDto, GetProblemResponseDto>("problem/getProblem");
export const setProblemPermissions = createPostApi<SetProblemPermissionsRequestDto, SetProblemPermissionsResponseDto>(
  "problem/setProblemPermissions"
);
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
export const downloadProblemFiles = createPostApi<DownloadProblemFilesRequestDto, DownloadProblemFilesResponseDto>(
  "problem/downloadProblemFiles"
);
export const renameProblemFile = createPostApi<RenameProblemFileRequestDto, RenameProblemFileResponseDto>(
  "problem/renameProblemFile"
);
export const updateProblemJudgeInfo = createPostApi<
  UpdateProblemJudgeInfoRequestDto,
  UpdateProblemJudgeInfoResponseDto
>("problem/updateProblemJudgeInfo");

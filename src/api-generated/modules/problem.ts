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

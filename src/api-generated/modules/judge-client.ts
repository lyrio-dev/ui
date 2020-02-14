// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type AddJudgeClientRequestDto = ApiTypes.AddJudgeClientRequestDto;
export type AddJudgeClientResponseDto = ApiTypes.AddJudgeClientResponseDto;
export type DeleteJudgeClientRequestDto = ApiTypes.DeleteJudgeClientRequestDto;
export type DeleteJudgeClientResponseDto = ApiTypes.DeleteJudgeClientResponseDto;
export type ResetJudgeClientKeyRequestDto = ApiTypes.ResetJudgeClientKeyRequestDto;
export type ResetJudgeClientKeyResponseDto = ApiTypes.ResetJudgeClientKeyResponseDto;
export type ListJudgeClientsResponseDto = ApiTypes.ListJudgeClientsResponseDto;

export const addJudgeClient = createPostApi<AddJudgeClientRequestDto, AddJudgeClientResponseDto>(
  "judgeClient/addJudgeClient"
);
export const deleteJudgeClient = createPostApi<DeleteJudgeClientRequestDto, DeleteJudgeClientResponseDto>(
  "judgeClient/deleteJudgeClient"
);
export const resetJudgeClientKey = createPostApi<ResetJudgeClientKeyRequestDto, ResetJudgeClientKeyResponseDto>(
  "judgeClient/resetJudgeClientKey"
);
export const listJudgeClients = createGetApi<void, ListJudgeClientsResponseDto>("judgeClient/listJudgeClients");

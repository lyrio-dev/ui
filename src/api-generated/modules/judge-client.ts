// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const addJudgeClient = createPostApi<ApiTypes.AddJudgeClientRequestDto, ApiTypes.AddJudgeClientResponseDto>(
  "judgeClient/addJudgeClient",
  false
);
export const deleteJudgeClient = createPostApi<
  ApiTypes.DeleteJudgeClientRequestDto,
  ApiTypes.DeleteJudgeClientResponseDto
>("judgeClient/deleteJudgeClient", false);
export const resetJudgeClientKey = createPostApi<
  ApiTypes.ResetJudgeClientKeyRequestDto,
  ApiTypes.ResetJudgeClientKeyResponseDto
>("judgeClient/resetJudgeClientKey", false);
export const listJudgeClients = createGetApi<void, ApiTypes.ListJudgeClientsResponseDto>(
  "judgeClient/listJudgeClients"
);

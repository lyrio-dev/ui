// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const queryProblemSet = createPostApi<ApiTypes.QueryProblemSetRequestDto, ApiTypes.QueryProblemSetResponseDto>(
  "problem/queryProblemSet"
);
export const createProblem = createPostApi<ApiTypes.CreateProblemRequestDto, ApiTypes.CreateProblemResponseDto>(
  "problem/createProblem"
);
export const updateStatement = createPostApi<
  ApiTypes.UpdateProblemStatementRequestDto,
  ApiTypes.UpdateProblemStatementResponseDto
>("problem/updateStatement");
export const getProblem = createPostApi<ApiTypes.GetProblemRequestDto, ApiTypes.GetProblemResponseDto>(
  "problem/getProblem"
);
export const setProblemPermissions = createPostApi<
  ApiTypes.SetProblemPermissionsRequestDto,
  ApiTypes.SetProblemPermissionsResponseDto
>("problem/setProblemPermissions");
export const setProblemDisplayId = createPostApi<
  ApiTypes.SetProblemDisplayIdRequestDto,
  ApiTypes.SetProblemDisplayIdResponseDto
>("problem/setProblemDisplayId");
export const setProblemPublic = createPostApi<
  ApiTypes.SetProblemPublicRequestDto,
  ApiTypes.SetProblemPublicResponseDto
>("problem/setProblemPublic");
export const addProblemFile = createPostApi<ApiTypes.AddProblemFileRequestDto, ApiTypes.AddProblemFileResponseDto>(
  "problem/addProblemFile"
);
export const removeProblemFiles = createPostApi<
  ApiTypes.RemoveProblemFilesRequestDto,
  ApiTypes.RemoveProblemFilesResponseDto
>("problem/removeProblemFiles");
export const downloadProblemFiles = createPostApi<
  ApiTypes.DownloadProblemFilesRequestDto,
  ApiTypes.DownloadProblemFilesResponseDto
>("problem/downloadProblemFiles");
export const renameProblemFile = createPostApi<
  ApiTypes.RenameProblemFileRequestDto,
  ApiTypes.RenameProblemFileResponseDto
>("problem/renameProblemFile");
export const updateProblemJudgeInfo = createPostApi<
  ApiTypes.UpdateProblemJudgeInfoRequestDto,
  ApiTypes.UpdateProblemJudgeInfoResponseDto
>("problem/updateProblemJudgeInfo");
export const getAllProblemTags = createPostApi<
  ApiTypes.GetAllProblemTagsRequestDto,
  ApiTypes.GetAllProblemTagsResponseDto
>("problem/getAllProblemTags");
export const createProblemTag = createPostApi<
  ApiTypes.CreateProblemTagRequestDto,
  ApiTypes.CreateProblemTagResponseDto
>("problem/createProblemTag");
export const getProblemTagDetail = createPostApi<
  ApiTypes.GetProblemTagDetailRequestDto,
  ApiTypes.GetProblemTagDetailResponseDto
>("problem/getProblemTagDetail");
export const updateProblemTag = createPostApi<
  ApiTypes.UpdateProblemTagRequestDto,
  ApiTypes.UpdateProblemTagResponseDto
>("problem/updateProblemTag");
export const deleteProblemTag = createPostApi<
  ApiTypes.DeleteProblemTagRequestDto,
  ApiTypes.DeleteProblemTagResponseDto
>("problem/deleteProblemTag");
export const getAllProblemTagsOfAllLocales = createPostApi<void, ApiTypes.GetAllProblemTagsOfAllLocalesResponseDto>(
  "problem/getAllProblemTagsOfAllLocales"
);
export const deleteProblem = createPostApi<ApiTypes.DeleteProblemRequestDto, ApiTypes.DeleteProblemResponseDto>(
  "problem/deleteProblem"
);
export const changeProblemType = createPostApi<
  ApiTypes.ChangeProblemTypeRequestDto,
  ApiTypes.ChangeProblemTypeResponseDto
>("problem/changeProblemType");

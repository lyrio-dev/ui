// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const queryProblemSet = createPostApi<ApiTypes.QueryProblemSetRequestDto, ApiTypes.QueryProblemSetResponseDto>(
  "problem/queryProblemSet",
  false
);
export const createProblem = createPostApi<ApiTypes.CreateProblemRequestDto, ApiTypes.CreateProblemResponseDto>(
  "problem/createProblem",
  true
);
export const updateStatement = createPostApi<
  ApiTypes.UpdateProblemStatementRequestDto,
  ApiTypes.UpdateProblemStatementResponseDto
>("problem/updateStatement", false);
export const getProblem = createPostApi<ApiTypes.GetProblemRequestDto, ApiTypes.GetProblemResponseDto>(
  "problem/getProblem",
  false
);
export const setProblemAccessControlList = createPostApi<
  ApiTypes.SetProblemAccessControlListRequestDto,
  ApiTypes.SetProblemAccessControlListResponseDto
>("problem/setProblemAccessControlList", false);
export const setProblemDisplayId = createPostApi<
  ApiTypes.SetProblemDisplayIdRequestDto,
  ApiTypes.SetProblemDisplayIdResponseDto
>("problem/setProblemDisplayId", false);
export const setProblemPublic = createPostApi<
  ApiTypes.SetProblemPublicRequestDto,
  ApiTypes.SetProblemPublicResponseDto
>("problem/setProblemPublic", false);
export const addProblemFile = createPostApi<ApiTypes.AddProblemFileRequestDto, ApiTypes.AddProblemFileResponseDto>(
  "problem/addProblemFile",
  true
);
export const removeProblemFiles = createPostApi<
  ApiTypes.RemoveProblemFilesRequestDto,
  ApiTypes.RemoveProblemFilesResponseDto
>("problem/removeProblemFiles", false);
export const downloadProblemFiles = createPostApi<
  ApiTypes.DownloadProblemFilesRequestDto,
  ApiTypes.DownloadProblemFilesResponseDto
>("problem/downloadProblemFiles", false);
export const renameProblemFile = createPostApi<
  ApiTypes.RenameProblemFileRequestDto,
  ApiTypes.RenameProblemFileResponseDto
>("problem/renameProblemFile", false);
export const updateProblemJudgeInfo = createPostApi<
  ApiTypes.UpdateProblemJudgeInfoRequestDto,
  ApiTypes.UpdateProblemJudgeInfoResponseDto
>("problem/updateProblemJudgeInfo", false);
export const getAllProblemTags = createPostApi<
  ApiTypes.GetAllProblemTagsRequestDto,
  ApiTypes.GetAllProblemTagsResponseDto
>("problem/getAllProblemTags", false);
export const createProblemTag = createPostApi<
  ApiTypes.CreateProblemTagRequestDto,
  ApiTypes.CreateProblemTagResponseDto
>("problem/createProblemTag", false);
export const getProblemTagDetail = createPostApi<
  ApiTypes.GetProblemTagDetailRequestDto,
  ApiTypes.GetProblemTagDetailResponseDto
>("problem/getProblemTagDetail", false);
export const updateProblemTag = createPostApi<
  ApiTypes.UpdateProblemTagRequestDto,
  ApiTypes.UpdateProblemTagResponseDto
>("problem/updateProblemTag", false);
export const deleteProblemTag = createPostApi<
  ApiTypes.DeleteProblemTagRequestDto,
  ApiTypes.DeleteProblemTagResponseDto
>("problem/deleteProblemTag", false);
export const getAllProblemTagsOfAllLocales = createPostApi<void, ApiTypes.GetAllProblemTagsOfAllLocalesResponseDto>(
  "problem/getAllProblemTagsOfAllLocales",
  false
);
export const deleteProblem = createPostApi<ApiTypes.DeleteProblemRequestDto, ApiTypes.DeleteProblemResponseDto>(
  "problem/deleteProblem",
  false
);
export const changeProblemType = createPostApi<
  ApiTypes.ChangeProblemTypeRequestDto,
  ApiTypes.ChangeProblemTypeResponseDto
>("problem/changeProblemType", false);

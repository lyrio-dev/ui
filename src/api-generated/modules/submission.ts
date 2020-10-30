// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const submit = createPostApi<ApiTypes.SubmitRequestDto, ApiTypes.SubmitResponseDto>("submission/submit", true);
export const querySubmission = createPostApi<ApiTypes.QuerySubmissionRequestDto, ApiTypes.QuerySubmissionResponseDto>(
  "submission/querySubmission",
  false
);
export const getSubmissionDetail = createPostApi<
  ApiTypes.GetSubmissionDetailRequestDto,
  ApiTypes.GetSubmissionDetailResponseDto
>("submission/getSubmissionDetail", false);
export const downloadSubmissionFile = createPostApi<
  ApiTypes.DownloadSubmissionFileRequestDto,
  ApiTypes.DownloadSubmissionFileResponseDto
>("submission/downloadSubmissionFile", false);
export const querySubmissionStatistics = createPostApi<
  ApiTypes.QuerySubmissionStatisticsRequestDto,
  ApiTypes.QuerySubmissionStatisticsResponseDto
>("submission/querySubmissionStatistics", false);
export const rejudgeSubmission = createPostApi<
  ApiTypes.RejudgeSubmissionRequestDto,
  ApiTypes.RejudgeSubmissionResponseDto
>("submission/rejudgeSubmission", false);
export const cancelSubmission = createPostApi<
  ApiTypes.CancelSubmissionRequestDto,
  ApiTypes.CancelSubmissionResponseDto
>("submission/cancelSubmission", false);
export const setSubmissionPublic = createPostApi<
  ApiTypes.SetSubmissionPublicRequestDto,
  ApiTypes.SetSubmissionPublicResponseDto
>("submission/setSubmissionPublic", false);
export const deleteSubmission = createPostApi<
  ApiTypes.DeleteSubmissionRequestDto,
  ApiTypes.DeleteSubmissionResponseDto
>("submission/deleteSubmission", false);

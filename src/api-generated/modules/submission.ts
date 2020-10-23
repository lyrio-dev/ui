// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const submit = createPostApi<ApiTypes.SubmitRequestDto, ApiTypes.SubmitResponseDto>("submission/submit");
export const querySubmission = createPostApi<ApiTypes.QuerySubmissionRequestDto, ApiTypes.QuerySubmissionResponseDto>(
  "submission/querySubmission"
);
export const getSubmissionDetail = createPostApi<
  ApiTypes.GetSubmissionDetailRequestDto,
  ApiTypes.GetSubmissionDetailResponseDto
>("submission/getSubmissionDetail");
export const downloadSubmissionFile = createPostApi<
  ApiTypes.DownloadSubmissionFileRequestDto,
  ApiTypes.DownloadSubmissionFileResponseDto
>("submission/downloadSubmissionFile");
export const querySubmissionStatistics = createPostApi<
  ApiTypes.QuerySubmissionStatisticsRequestDto,
  ApiTypes.QuerySubmissionStatisticsResponseDto
>("submission/querySubmissionStatistics");
export const rejudgeSubmission = createPostApi<
  ApiTypes.RejudgeSubmissionRequestDto,
  ApiTypes.RejudgeSubmissionResponseDto
>("submission/rejudgeSubmission");
export const cancelSubmission = createPostApi<
  ApiTypes.CancelSubmissionRequestDto,
  ApiTypes.CancelSubmissionResponseDto
>("submission/cancelSubmission");
export const setSubmissionPublic = createPostApi<
  ApiTypes.SetSubmissionPublicRequestDto,
  ApiTypes.SetSubmissionPublicResponseDto
>("submission/setSubmissionPublic");
export const deleteSubmission = createPostApi<
  ApiTypes.DeleteSubmissionRequestDto,
  ApiTypes.DeleteSubmissionResponseDto
>("submission/deleteSubmission");

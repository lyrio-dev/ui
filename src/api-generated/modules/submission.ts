// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type SubmitRequestDto = ApiTypes.SubmitRequestDto;
export type SubmitResponseDto = ApiTypes.SubmitResponseDto;
export type QuerySubmissionRequestDto = ApiTypes.QuerySubmissionRequestDto;
export type QuerySubmissionResponseDto = ApiTypes.QuerySubmissionResponseDto;
export type GetSubmissionDetailRequestDto = ApiTypes.GetSubmissionDetailRequestDto;
export type GetSubmissionDetailResponseDto = ApiTypes.GetSubmissionDetailResponseDto;
export type QuerySubmissionStatisticsRequestDto = ApiTypes.QuerySubmissionStatisticsRequestDto;
export type QuerySubmissionStatisticsResponseDto = ApiTypes.QuerySubmissionStatisticsResponseDto;
export type RejudgeSubmissionRequestDto = ApiTypes.RejudgeSubmissionRequestDto;
export type RejudgeSubmissionResponseDto = ApiTypes.RejudgeSubmissionResponseDto;
export type CancelSubmissionRequestDto = ApiTypes.CancelSubmissionRequestDto;
export type CancelSubmissionResponseDto = ApiTypes.CancelSubmissionResponseDto;

export const submit = createPostApi<SubmitRequestDto, SubmitResponseDto>("submission/submit");
export const querySubmission = createPostApi<QuerySubmissionRequestDto, QuerySubmissionResponseDto>(
  "submission/querySubmission"
);
export const getSubmissionDetail = createPostApi<GetSubmissionDetailRequestDto, GetSubmissionDetailResponseDto>(
  "submission/getSubmissionDetail"
);
export const querySubmissionStatistics = createPostApi<
  QuerySubmissionStatisticsRequestDto,
  QuerySubmissionStatisticsResponseDto
>("submission/querySubmissionStatistics");
export const rejudgeSubmission = createPostApi<RejudgeSubmissionRequestDto, RejudgeSubmissionResponseDto>(
  "submission/rejudgeSubmission"
);
export const cancelSubmission = createPostApi<CancelSubmissionRequestDto, CancelSubmissionResponseDto>(
  "submission/cancelSubmission"
);

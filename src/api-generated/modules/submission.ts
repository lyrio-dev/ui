// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type SubmitRequestDto = ApiTypes.SubmitRequestDto;
export type SubmitResponseDto = ApiTypes.SubmitResponseDto;
export type QuerySubmissionRequestDto = ApiTypes.QuerySubmissionRequestDto;
export type QuerySubmissionResponseDto = ApiTypes.QuerySubmissionResponseDto;
export type GetSubmissionDetailRequestDto = ApiTypes.GetSubmissionDetailRequestDto;
export type GetSubmissionDetailResponseDto = ApiTypes.GetSubmissionDetailResponseDto;

export const submit = createPostApi<SubmitRequestDto, SubmitResponseDto>("submission/submit");
export const querySubmission = createPostApi<QuerySubmissionRequestDto, QuerySubmissionResponseDto>(
  "submission/querySubmission"
);
export const getSubmissionDetail = createPostApi<GetSubmissionDetailRequestDto, GetSubmissionDetailResponseDto>(
  "submission/getSubmissionDetail"
);

// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type SubmitRequestDto = ApiTypes.SubmitRequestDto;
export type SubmitResponseDto = ApiTypes.SubmitResponseDto;

export const submit = createPostApi<SubmitRequestDto, SubmitResponseDto>("submission/submit");

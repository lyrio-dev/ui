// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type FinishUploadRequestDto = ApiTypes.FinishUploadRequestDto;
export type FinishUploadResponseDto = ApiTypes.FinishUploadResponseDto;

export const finishUpload = createPostApi<FinishUploadRequestDto, FinishUploadResponseDto>("file/finishUpload");

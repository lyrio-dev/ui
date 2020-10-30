// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const migrateUser = createPostApi<ApiTypes.MigrateUserRequestDto, ApiTypes.MigrateUserResponseDto>(
  "migration/migrateUser",
  false
);
export const queryUserMigrationInfo = createPostApi<
  ApiTypes.QueryUserMigrationInfoRequestDto,
  ApiTypes.QueryUserMigrationInfoResponseDto
>("migration/queryUserMigrationInfo", false);

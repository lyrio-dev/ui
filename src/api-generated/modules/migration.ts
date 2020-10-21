// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type MigrateUserRequestDto = ApiTypes.MigrateUserRequestDto;
export type MigrateUserResponseDto = ApiTypes.MigrateUserResponseDto;
export type QueryUserMigrationInfoRequestDto = ApiTypes.QueryUserMigrationInfoRequestDto;
export type QueryUserMigrationInfoResponseDto = ApiTypes.QueryUserMigrationInfoResponseDto;

export const migrateUser = createPostApi<MigrateUserRequestDto, MigrateUserResponseDto>("migration/migrateUser");
export const queryUserMigrationInfo = createPostApi<
  QueryUserMigrationInfoRequestDto,
  QueryUserMigrationInfoResponseDto
>("migration/queryUserMigrationInfo");

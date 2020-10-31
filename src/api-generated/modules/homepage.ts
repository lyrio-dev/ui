// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const getHomepage = createGetApi<{ locale: string }, ApiTypes.GetHomepageResponseDto>("homepage/getHomepage");
export const getHomepageSettings = createGetApi<void, ApiTypes.GetHomepageSettingsResponseDto>(
  "homepage/getHomepageSettings"
);
export const updateHomepageSettings = createPostApi<
  ApiTypes.UpdateHomepageSettingsRequestDto,
  ApiTypes.UpdateHomepageSettingsResponseDto
>("homepage/updateHomepageSettings", false);

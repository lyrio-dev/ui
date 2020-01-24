// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type GetSelfMetaResponseDto = ApiTypes.GetSelfMetaResponseDto;
export type LoginRequestDto = ApiTypes.LoginRequestDto;
export type LoginResponseDto = ApiTypes.LoginResponseDto;
export type CheckAvailabilityResponseDto = ApiTypes.CheckAvailabilityResponseDto;
export type RegisterRequestDto = ApiTypes.RegisterRequestDto;
export type RegisterResponseDto = ApiTypes.RegisterResponseDto;

export const getSelfMeta = createGetApi<void, GetSelfMetaResponseDto>("auth/getSelfMeta");
export const login = createPostApi<LoginRequestDto, LoginResponseDto>("auth/login");
export const logout = createPostApi<void, void>("auth/logout");
export const checkAvailability = createGetApi<{ username?: string; email?: string }, CheckAvailabilityResponseDto>(
  "auth/checkAvailability"
);
export const register = createPostApi<RegisterRequestDto, RegisterResponseDto>("auth/register");

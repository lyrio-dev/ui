// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export const getSessionInfo = createGetApi<{ token?: string; jsonp?: string }, ApiTypes.GetSessionInfoResponseDto>(
  "auth/getSessionInfo"
);
export const login = createPostApi<ApiTypes.LoginRequestDto, ApiTypes.LoginResponseDto>("auth/login", true);
export const logout = createPostApi<void, void>("auth/logout", false);
export const checkAvailability = createGetApi<
  { username?: string; email?: string },
  ApiTypes.CheckAvailabilityResponseDto
>("auth/checkAvailability");
export const sendEmailVerifactionCode = createPostApi<
  ApiTypes.SendEmailVerificationCodeRequestDto,
  ApiTypes.SendEmailVerificationCodeResponseDto
>("auth/sendEmailVerifactionCode", true);
export const register = createPostApi<ApiTypes.RegisterRequestDto, ApiTypes.RegisterResponseDto>("auth/register", true);
export const resetPassword = createPostApi<ApiTypes.ResetPasswordRequestDto, ApiTypes.ResetPasswordResponseDto>(
  "auth/resetPassword",
  true
);
export const listUserSessions = createPostApi<
  ApiTypes.ListUserSessionsRequestDto,
  ApiTypes.ListUserSessionsResponseDto
>("auth/listUserSessions", false);
export const revokeUserSession = createPostApi<
  ApiTypes.RevokeUserSessionRequestDto,
  ApiTypes.RevokeUserSessionResponseDto
>("auth/revokeUserSession", false);

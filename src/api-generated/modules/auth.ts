// This file is generated automatically, do NOT modify it.

/// <reference path="../types.d.ts" />

import { createGetApi, createPostApi } from "@/api";

export type GetSessionInfoResponseDto = ApiTypes.GetSessionInfoResponseDto;
export type LoginRequestDto = ApiTypes.LoginRequestDto;
export type LoginResponseDto = ApiTypes.LoginResponseDto;
export type CheckAvailabilityResponseDto = ApiTypes.CheckAvailabilityResponseDto;
export type SendEmailVerificationCodeRequestDto = ApiTypes.SendEmailVerificationCodeRequestDto;
export type SendEmailVerificationCodeResponseDto = ApiTypes.SendEmailVerificationCodeResponseDto;
export type RegisterRequestDto = ApiTypes.RegisterRequestDto;
export type RegisterResponseDto = ApiTypes.RegisterResponseDto;
export type ResetPasswordRequestDto = ApiTypes.ResetPasswordRequestDto;
export type ResetPasswordResponseDto = ApiTypes.ResetPasswordResponseDto;
export type ListUserSessionsRequestDto = ApiTypes.ListUserSessionsRequestDto;
export type ListUserSessionsResponseDto = ApiTypes.ListUserSessionsResponseDto;
export type RevokeUserSessionRequestDto = ApiTypes.RevokeUserSessionRequestDto;
export type RevokeUserSessionResponseDto = ApiTypes.RevokeUserSessionResponseDto;

export const getSessionInfo = createGetApi<{ token?: string; jsonp?: string }, GetSessionInfoResponseDto>(
  "auth/getSessionInfo"
);
export const login = createPostApi<LoginRequestDto, LoginResponseDto>("auth/login");
export const logout = createPostApi<void, void>("auth/logout");
export const checkAvailability = createGetApi<{ username?: string; email?: string }, CheckAvailabilityResponseDto>(
  "auth/checkAvailability"
);
export const sendEmailVerifactionCode = createPostApi<
  SendEmailVerificationCodeRequestDto,
  SendEmailVerificationCodeResponseDto
>("auth/sendEmailVerifactionCode");
export const register = createPostApi<RegisterRequestDto, RegisterResponseDto>("auth/register");
export const resetPassword = createPostApi<ResetPasswordRequestDto, ResetPasswordResponseDto>("auth/resetPassword");
export const listUserSessions = createPostApi<ListUserSessionsRequestDto, ListUserSessionsResponseDto>(
  "auth/listUserSessions"
);
export const revokeUserSession = createPostApi<RevokeUserSessionRequestDto, RevokeUserSessionResponseDto>(
  "auth/revokeUserSession"
);

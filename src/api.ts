import axios from "axios";

import { appState } from "./appState";
import { makeToBeLocalizedText, ToBeLocalizedText } from "./locales";

export interface ApiResponse<T> {
  requestError?: ToBeLocalizedText;
  response?: T;
}

async function request<T>(
  path: string,
  method: "get" | "post",
  params?: any,
  body?: any,
  recaptchaToken?: string
): Promise<ApiResponse<T>> {
  let response: any;
  try {
    response = await axios(window.apiEndpoint + "api/" + path, {
      method: method,
      params: params,
      data: body && JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: appState.token && `Bearer ${appState.token}`,
        ...(recaptchaToken ? { "X-Recaptcha-Token": recaptchaToken } : {})
      },
      validateStatus: () => true
    });
  } catch (e) {
    console.error(e);
    return {
      requestError: makeToBeLocalizedText("common.request_error.unknown", { text: e.message })
    };
  }

  if (![200, 201].includes(response.status)) {
    try {
      console.log("response.data:", response.data);
    } catch (e) {
      console.log("response:", response);
    }

    if ([400, 401, 500, 502, 503, 504].includes(response.status))
      return {
        requestError: makeToBeLocalizedText(`common.request_error.${response.status}`)
      };

    return {
      requestError: makeToBeLocalizedText("common.request_error.unknown", {
        text: `${response.status} ${response.statusText}`
      })
    };
  }

  return {
    response: typeof response.data === "string" ? JSON.parse(response.data) : response.data
  };
}

import * as api from "./api-generated";
export default api;

export function createPostApi<BodyType, ResponseType>(
  path: string,
  recaptcha: true
): (requestBody: BodyType, recaptchaTokenPromise: Promise<string>) => Promise<ApiResponse<ResponseType>>;
export function createPostApi<BodyType, ResponseType>(
  path: string,
  recaptcha: false
): (requestBody: BodyType) => Promise<ApiResponse<ResponseType>>;

export function createPostApi<BodyType, ResponseType>(path: string, recaptcha: boolean) {
  return async (requestBody: BodyType, recaptchaTokenPromise?: Promise<string>): Promise<ApiResponse<ResponseType>> => {
    return await request<ResponseType>(path, "post", null, requestBody, await recaptchaTokenPromise);
  };
}

export function createGetApi<QueryType, ResponseType>(path: string) {
  return async (requestQuery: QueryType): Promise<ApiResponse<ResponseType>> => {
    return await request<ResponseType>(path, "get", requestQuery, null);
  };
}

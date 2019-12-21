import axios from "axios";

import { appConfig } from "./appConfig";
import { appState } from "./appState";

export interface ApiResponse<T> {
  requestError?: string;
  response?: T;
}

async function request<T>(path: string, method: "get" | "post", params?: any, body?: any): Promise<ApiResponse<T>> {
  let response: any;
  try {
    response = await axios(appConfig.apiEndpoint + path, {
      method: method,
      params: params,
      data: body && JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: appState.token && `Bearer ${appState.token}`
      }
    });
  } catch (e) {
    return {
      requestError: e.message
    };
  }

  if (![200, 201].includes(response.status)) {
    // TODO: Handle unexpected errors
    try {
      console.log(response.data);
    } catch (e) {}
    return {
      requestError: `${response.status} ${response.statusText}`
    };
  }

  return {
    response: typeof response.data === "string" ? JSON.parse(response.data) : response.data
  };
}

export * from "./api-generated";

export function createPostApi<BodyType, ResponseType>(path: string) {
  return async (requestBody: BodyType): Promise<ApiResponse<ResponseType>> => {
    return await request<ResponseType>(path, "post", null, requestBody);
  };
}

export function createGetApi<QueryType, ResponseType>(path: string) {
  return async (requestQuery: QueryType): Promise<ApiResponse<ResponseType>> => {
    return await request<ResponseType>(path, "get", requestQuery, null);
  };
}

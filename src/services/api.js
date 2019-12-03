import axios from "axios";

let token = localStorage.getItem("token");

export default async function api(path, method, body) {
  let response;
  try {
    response = await axios(window._appConfig.apiEndpoint + path, {
      method: method,
      data: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        Authorization: token && `Bearer ${token}`
      }
    });
  } catch (e) {
    return {
      requestError: e.message
    };
  }

  if (![200, 201].includes(response.status)) {
    try {
      console.log(response.data);
    } catch (e) {}
    return {
      requestError: `${response.status} ${response.statusText}`
    };
  }

  return {
    response:
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data
  };
}

export async function get(path) {
  return await api(path, "GET");
}

export async function post(path, body) {
  return await api(path, "POST", body);
}

api.get = get;
api.post = post;

api.getToken = () => token;
api.setToken = newToken => {
  token = newToken;
  localStorage.setItem("token", newToken);
};

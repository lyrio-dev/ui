const ROOT_URL = "http://localhost:8001/api/";

export default async function api(path, method, body) {
  let response;
  try {
    response = await fetch(ROOT_URL + path, {
      method: method,
      body: JSON.stringify(body),
      credentials: "include"
    });
  } catch (e) {
    return {
      success: false,
      message: e.message
    };
  }

  if (!response.ok) {
    return {
      success: false,
      message: `${response.status} ${response.statusText}`
    };
  }

  try {
    return response.json();
  } catch (e) {
    return {
      success: false,
      message: "Error parsing server response: " + e.message
    };
  }
}

export async function get(path) {
  return await api(path, "GET");
}

export async function post(path, body) {
  return await api(path, "POST", body);
}

api.get = get;
api.post = post;

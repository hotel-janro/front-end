// api.js - Simple API utility for back-end communication

export const API_HOST = (import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:5000").replace(/\/$/, "");
const BASE_URL = `${API_HOST}/api`;

export const apiFetch = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem("janro_user") || "{}");
  const token = user.token; // Assuming token is stored in the user object

  // If body is FormData, do not set Content-Type so the browser can add the multipart boundary
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Unable to reach API server");
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && data?.message
      ? data.message
      : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

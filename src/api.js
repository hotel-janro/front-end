// api.js - Simple API utility for back-end communication

const BASE_URL = "http://localhost:5000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("janro_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401 Unauthorized, try refreshing the token
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("janro_refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshRes.ok) {
          const { token: newToken } = await refreshRes.json();
          localStorage.setItem("janro_token", newToken);

          // Retry the original request with the new token
          headers.Authorization = `Bearer ${newToken}`;
          response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      } catch (err) {
        console.error("Token refresh failed:", err);
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// api.js - Simple API utility for back-end communication

const BASE_URL = "http://localhost:5000/api";

export const apiFetch = async (endpoint, options = {}) => {
  const user = JSON.parse(localStorage.getItem("janro_user") || "{}");
  const token = user.token; // Assuming token is stored in the user object

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

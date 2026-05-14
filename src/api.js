// api.js - Simple API utility for back-end communication

export const API_HOST = (import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || "http://localhost:5000").replace(/\/$/, "");
const BASE_URL = `${API_HOST}/api`;

export const apiFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem("janro_token");

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

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
  
  // Clean up any backslashes and leading slashes
  let cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/, '');
  
  // If the path doesn't already start with 'uploads/', prepend it
  // This ensures images are correctly routed to the backend's static file server
  if (!cleanPath.startsWith('uploads/')) {
    cleanPath = `uploads/${cleanPath}`;
  }
  
  // Encode each segment of the path to handle spaces and special characters in filenames
  const encodedPath = cleanPath.split('/').map(seg => encodeURIComponent(seg)).join('/');
  
  return `${API_HOST}/${encodedPath}`;
};

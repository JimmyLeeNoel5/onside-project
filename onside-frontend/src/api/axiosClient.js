import axios from "axios";

// ── In-memory token storage ────────────────────────────────────────────────────

let _accessToken = null;

export const setAccessToken = (token) => {
  _accessToken = token;
};
export const getAccessToken = () => _accessToken;
export const clearAuth = () => {
  _accessToken = null;
  localStorage.removeItem("refreshToken");
};

// ── Base instance ──────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ────────────────────────────────────────────────────────

axiosClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor ──────────────────────────────────────────────────────

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        clearAuth();
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);

// ── Silent token refresh ───────────────────────────────────────────────────────

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token");

  const response = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = response.data;

  setAccessToken(accessToken);
  localStorage.setItem("refreshToken", newRefreshToken);

  return accessToken;
};

export default axiosClient;

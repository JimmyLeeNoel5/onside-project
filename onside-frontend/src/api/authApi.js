import axiosClient from "./axiosClient";

export const register = (data) => axiosClient.post("/auth/register", data);

export const login = (data) => axiosClient.post("/auth/login", data);
export const logout = (data) => axiosClient.post("/auth/logout", data);

export const logoutAll = () => axiosClient.post("/auth/logout-all");

export const refresh = (data) => axiosClient.post("/auth/refresh", data);

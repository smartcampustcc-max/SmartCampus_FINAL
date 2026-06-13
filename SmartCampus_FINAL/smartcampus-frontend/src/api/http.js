import axios from "axios";
import { getToken, logoutLocal } from "./auth";

const http = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api",
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token expirou/invalidou
      logoutLocal();
      // opcional: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default http;
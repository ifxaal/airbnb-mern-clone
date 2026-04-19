import axios from "axios";

const apiBaseURL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : "/api");

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
});

// Automatically attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getImageSrc = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const base = apiBaseURL.endsWith("/") ? apiBaseURL.slice(0, -1) : apiBaseURL;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${base}${path}`;
};

export default api;

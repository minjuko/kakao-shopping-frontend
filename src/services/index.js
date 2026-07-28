import axios from "axios";
import { getAuthToken } from "../utils/localStorage";

const staticServerUri = process.env.REACT_APP_PATH || "";

export const instance = axios.create({
  baseURL: staticServerUri + "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

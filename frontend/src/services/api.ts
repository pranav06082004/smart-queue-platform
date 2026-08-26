import axios from "axios";
import { getToken } from "./authStorage";

export const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Attach the JWT to every outgoing request automatically, if we have one.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
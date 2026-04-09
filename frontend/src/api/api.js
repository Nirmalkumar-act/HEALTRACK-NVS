// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || "http://localhost:8081/api").replace(/\/$/, ""),
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

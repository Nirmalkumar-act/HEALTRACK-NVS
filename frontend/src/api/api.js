// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081/api", // ✅ fallback if .env not set
  withCredentials: false, // ❌ turn off unless you use cookie sessions
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

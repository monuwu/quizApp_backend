import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Token storage key
const TOKEN_KEY = "auth_token";

// Get token from localStorage
const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; errors?: Array<{ field: string; message: string }> }>) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      // Handle 401 Unauthorized - Clear auth and redirect
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem("auth_user");
          // Optionally redirect to login
          // window.location.href = '/auth/login';
        }
      }

      // Return formatted error
      return Promise.reject({
        success: false,
        message: data?.message || "An error occurred",
        errors: data?.errors,
        status,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        success: false,
        message: "Network error. Please check your connection.",
        status: 0,
      });
    } else {
      // Error setting up request
      return Promise.reject({
        success: false,
        message: error.message || "An error occurred",
        status: 0,
      });
    }
  }
);

export default api;


// utils/auth.ts
// Authentication API service - using Axios for HTTP requests

import api from "./axios";

// ============== Types ==============

export interface SignupData {
  name: string;
  country_code: string;
  phone_number: string;
  password: string;
  confirm_password: string;
}

export interface LoginData {
  phone: string;
  countryCode: string;
  password: string;
}

export interface ResetPasswordData {
  phone: string;
  countryCode: string;
  newPassword: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: {
      id: number;
      name: string;
      phone: string;
      email?: string;
    };
  };
  otp?: string; // For demo purposes only
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

// ============== Storage Helpers ==============

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const storage = {
  getToken: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  removeToken: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  getUser: (): any | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser: (user: any): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },

  removeUser: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY);
    }
  },

  clear: (): void => {
    storage.removeToken();
    storage.removeUser();
  },
};

// ============== Session Storage Helpers ==============

export const sessionStore = {
  setPhone: (phone: string): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("resetPhone", phone);
    }
  },

  getPhone: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("resetPhone");
  },

  setSignupData: (data: SignupData): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("signupData", JSON.stringify(data));
    }
  },

  getSignupData: (): SignupData | null => {
    if (typeof window === "undefined") return null;
    const data = sessionStorage.getItem("signupData");
    return data ? JSON.parse(data) : null;
  },

  setAuthFlow: (flow: "signup" | "login" | "reset"): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authFlow", flow);
    }
  },

  getAuthFlow: (): "signup" | "login" | "reset" | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("authFlow") as "signup" | "login" | "reset" | null;
  },

  setOtpData: (phone: string): void => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("otpPhone", phone);
    }
  },

  getOtpData: (): string | null => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem("otpPhone");
  },

  clear: (): void => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("resetPhone");
      sessionStorage.removeItem("signupData");
      sessionStorage.removeItem("authFlow");
      sessionStorage.removeItem("otpPhone");
    }
  },
};

// ============== OTP Functions (Backend API with Axios) ==============

/**
 * Request OTP from backend
 */
export async function sendOTP(phone: string, countryCode: string): Promise<AuthResponse> {
  const fullPhone = `${countryCode}${phone}`;

  // Store phone for OTP verification
  sessionStore.setOtpData(fullPhone);

  const response = await api.post<AuthResponse>("/auth/request-otp", {
    phone: fullPhone,
  });

  return response.data;
}

/**
 * Verify OTP with backend
 */
export async function verifyOTP(otp: string): Promise<AuthResponse> {
  const phone = sessionStore.getOtpData() || sessionStore.getPhone();

  if (!phone) {
    throw new Error("No phone number found. Please request a new OTP.");
  }

  const response = await api.post<AuthResponse>("/auth/verify-otp", {
    phone,
    otp,
  });

  return response.data;
}

/**
 * Resend OTP
 */
export async function resendOTP(): Promise<AuthResponse> {
  const phone = sessionStore.getOtpData() || sessionStore.getPhone();

  if (!phone) {
    throw new Error("No phone number found. Please restart the process.");
  }

  const response = await api.post<AuthResponse>("/auth/request-otp", {
    phone,
  });

  return response.data;
}

// ============== Auth API Functions (Axios) ==============

/**
 * Signup new user
 */
export async function signup(data: SignupData): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/signup", {
    name: data.name,
    country_code: data.country_code,
    phone_number: data.phone_number,
    password: data.password,
    confirm_password: data.confirm_password,
  });

  if (response.data.success && response.data.data?.token) {
    storage.setToken(response.data.data.token);
    if (response.data.data.user) {
      storage.setUser(response.data.data.user);
    }
  }

  return response.data;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const fullPhone = `${data.countryCode}${data.phone}`;

  const response = await api.post<AuthResponse>("/auth/login", {
    phone: fullPhone,
    password: data.password,
  });

  if (response.data.success && response.data.data?.token) {
    storage.setToken(response.data.data.token);
    if (response.data.data.user) {
      storage.setUser(response.data.data.user);
    }
  }

  return response.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  // Clear local storage
  storage.clear();
  sessionStore.clear();
}

/**
 * Request password reset
 */
export async function requestPasswordReset(phone: string, countryCode: string): Promise<AuthResponse> {
  const fullPhone = `${countryCode}${phone}`;

  // Store phone for later use
  sessionStore.setPhone(fullPhone);
  sessionStore.setOtpData(fullPhone);

  const response = await api.post<AuthResponse>("/auth/forgot-password", {
    phone: fullPhone,
  });

  return response.data;
}

/**
 * Reset password with OTP verification
 */
export async function resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
  const fullPhone = `${data.countryCode}${data.phone}`;

  const response = await api.post<AuthResponse>("/auth/reset-password", {
    phone: fullPhone,
    otp: data.otp,
    newPassword: data.newPassword,
  });

  return response.data;
}

/**
 * Set new password (after OTP verification)
 */
export async function setNewPassword(password: string): Promise<AuthResponse> {
  const phone = sessionStore.getPhone();

  if (!phone) {
    throw new Error("No phone number found. Please restart the process.");
  }

  const response = await api.post<AuthResponse>("/auth/set-password", {
    phone,
    password,
  });

  return response.data;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<AuthResponse> {
  const response = await api.get<AuthResponse>("/auth/profile");
  return response.data;
}

/**
 * Update user profile
 */
export async function updateProfile(data: { name?: string; email?: string }): Promise<AuthResponse> {
  const response = await api.put<AuthResponse>("/auth/profile", data);
  return response.data;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!storage.getToken();
}

/**
 * Get error message from API error
 */
export function getErrorMessage(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.errors && error.errors.length > 0) {
    return error.errors.map((e: any) => e.message).join(", ");
  }
  return "An error occurred. Please try again.";
}

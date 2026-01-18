"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  useSendOTP,
  useVerifyOTP,
  useResendOTP,
  useSignup,
  useLogin,
  useLogout,
  useSetPassword,
  useProfile,
} from "@/hooks/useAuth";
import {
  storage,
  sessionStore,
  SignupData,
  LoginData,
  getErrorMessage,
} from "@/utils/auth";

// ============== Types ==============

interface AuthUser {
  id?: number;
  name?: string;
  phone?: string;
  email?: string;
}

interface AuthContextProps {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  // Auth actions
  login: (data: LoginData) => Promise<{ success: boolean; message: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  // OTP actions
  sendOTP: (phone: string, countryCode: string) => Promise<{ success: boolean; message: string }>;
  verifyOTP: (otp: string) => Promise<{ success: boolean; message: string }>;
  resendOTP: () => Promise<{ success: boolean; message: string }>;

  // Password actions
  setPassword: (password: string) => Promise<{ success: boolean; message: string }>;

  // Session helpers
  setAuthFlow: (flow: 'signup' | 'login' | 'reset') => void;
  getAuthFlow: () => 'signup' | 'login' | 'reset' | null;
  setPhoneForReset: (phone: string) => void;
  getPhoneForReset: () => string | null;
  setSignupData: (data: SignupData) => void;
  getSignupData: () => SignupData | null;

  // Error handling
  clearError: () => void;
}

// ============== Context ==============

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ============== Provider ==============

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // React Query hooks
  const { data: profileData, isLoading: profileLoading } = useProfile();
  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();
  const resendOTPMutation = useResendOTP();
  const signupMutation = useSignup();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const setPasswordMutation = useSetPassword();

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = storage.getUser();
    const token = storage.getToken();

    if (storedUser && token) {
      setUser(storedUser);
    }

    setInitialLoading(false);
  }, []);

  // Update user when profile data changes
  useEffect(() => {
    if (profileData) {
      setUser(profileData);
      storage.setUser(profileData);
    }
  }, [profileData]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Calculate loading state
  const loading = initialLoading ||
    sendOTPMutation.isPending ||
    verifyOTPMutation.isPending ||
    resendOTPMutation.isPending ||
    signupMutation.isPending ||
    loginMutation.isPending ||
    logoutMutation.isPending ||
    setPasswordMutation.isPending;

  // Login
  const handleLogin = useCallback(async (data: LoginData): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await loginMutation.mutateAsync(data);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Login successful!' };
      }

      return { success: false, message: response.message || 'Login failed' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [loginMutation]);

  // Signup
  const handleSignup = useCallback(async (data: any): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await signupMutation.mutateAsync(data);

      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return { success: true, message: 'Signup successful!' };
      }

      return { success: false, message: response.message || 'Signup failed' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [signupMutation]);

  // Logout
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await logoutMutation.mutateAsync();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }, [logoutMutation]);

  // Send OTP
  const handleSendOTP = useCallback(async (
    phone: string,
    countryCode: string
  ): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await sendOTPMutation.mutateAsync({ phone, countryCode });

      if (response.success) {
        return { success: true, message: 'OTP sent successfully!' };
      }

      return { success: false, message: response.message || 'Failed to send OTP' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [sendOTPMutation]);

  // Verify OTP
  const handleVerifyOTP = useCallback(async (otp: string): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await verifyOTPMutation.mutateAsync(otp);

      if (response.success) {
        if (response.data?.user) {
          setUser(response.data.user);
        }
        return { success: true, message: 'OTP verified successfully!' };
      }

      return { success: false, message: response.message || 'Invalid OTP' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [verifyOTPMutation]);

  // Resend OTP
  const handleResendOTP = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await resendOTPMutation.mutateAsync();

      if (response.success) {
        return { success: true, message: 'OTP resent successfully!' };
      }

      return { success: false, message: response.message || 'Failed to resend OTP' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [resendOTPMutation]);

  // Set Password
  const handleSetPassword = useCallback(async (password: string): Promise<{ success: boolean; message: string }> => {
    setError(null);

    try {
      const response = await setPasswordMutation.mutateAsync(password);

      if (response.success) {
        if (response.data?.user) {
          setUser(response.data.user);
        }
        return { success: true, message: 'Password set successfully!' };
      }

      return { success: false, message: response.message || 'Failed to set password' };
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  }, [setPasswordMutation]);

  // Session helpers
  const setAuthFlow = useCallback((flow: 'signup' | 'login' | 'reset') => {
    sessionStore.setAuthFlow(flow);
  }, []);

  const getAuthFlow = useCallback(() => {
    return sessionStore.getAuthFlow();
  }, []);

  const setPhoneForReset = useCallback((phone: string) => {
    sessionStore.setPhone(phone);
  }, []);

  const getPhoneForReset = useCallback(() => {
    return sessionStore.getPhone();
  }, []);

  const setSignupData = useCallback((data: SignupData) => {
    sessionStore.setSignupData(data);
  }, []);

  const getSignupData = useCallback(() => {
    return sessionStore.getSignupData();
  }, []);

  const isAuthenticated = !!user && !!storage.getToken();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
        sendOTP: handleSendOTP,
        verifyOTP: handleVerifyOTP,
        resendOTP: handleResendOTP,
        setPassword: handleSetPassword,
        setAuthFlow,
        getAuthFlow,
        setPhoneForReset,
        getPhoneForReset,
        setSignupData,
        getSignupData,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============== Hook ==============

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

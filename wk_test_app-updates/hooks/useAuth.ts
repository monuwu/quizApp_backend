"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendOTP,
  verifyOTP,
  resendOTP,
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  setNewPassword,
  getProfile,
  updateProfile,
  storage,
  sessionStore,
  SignupData,
  LoginData,
  ResetPasswordData,
  AuthResponse,
} from "@/utils/auth";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// ============== Query Hooks ==============

/**
 * Hook to get current user profile
 */
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: getProfile,
    enabled: !!storage.getToken(),
    select: (data) => data.data?.user,
  });
}

// ============== Mutation Hooks ==============

/**
 * Hook to send OTP
 */
export function useSendOTP() {
  return useMutation({
    mutationFn: ({ phone, countryCode }: { phone: string; countryCode: string }) =>
      sendOTP(phone, countryCode),
    onSuccess: (data, variables) => {
      const fullPhone = `${variables.countryCode}${variables.phone}`;
      sessionStore.setPhone(fullPhone);
    },
  });
}

/**
 * Hook to verify OTP
 */
export function useVerifyOTP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (otp: string) => verifyOTP(otp),
    onSuccess: (data) => {
      if (data.data?.token && data.data?.user) {
        storage.setToken(data.data.token);
        storage.setUser(data.data.user);
        // Invalidate and refetch profile
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      }
    },
  });
}

/**
 * Hook to resend OTP
 */
export function useResendOTP() {
  return useMutation({
    mutationFn: resendOTP,
  });
}

/**
 * Hook to signup
 */
export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignupData) => signup(data),
    onSuccess: (data) => {
      if (data.data?.user) {
        queryClient.setQueryData(authKeys.profile(), data);
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      }
    },
  });
}

/**
 * Hook to login
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (data) => {
      if (data.data?.user) {
        queryClient.setQueryData(authKeys.profile(), data);
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      }
    },
  });
}

/**
 * Hook to logout
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: authKeys.all });
      queryClient.clear();
    },
  });
}

/**
 * Hook to request password reset
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: ({ phone, countryCode }: { phone: string; countryCode: string }) =>
      requestPasswordReset(phone, countryCode),
  });
}

/**
 * Hook to reset password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(data),
  });
}

/**
 * Hook to set new password
 */
export function useSetPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (password: string) => setNewPassword(password),
    onSuccess: (data) => {
      if (data.data?.token && data.data?.user) {
        storage.setToken(data.data.token);
        storage.setUser(data.data.user);
        queryClient.invalidateQueries({ queryKey: authKeys.profile() });
      }
    },
  });
}

/**
 * Hook to update profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) => updateProfile(data),
    onSuccess: (data) => {
      if (data.data?.user) {
        storage.setUser(data.data.user);
        queryClient.setQueryData(authKeys.profile(), data);
      }
    },
  });
}


"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DefaultNavbar from "@/components/DefaultNavbar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, EyeOff, Eye, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SetPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setPassword, getAuthFlow, loading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Check auth flow
  useEffect(() => {
    const authFlow = getAuthFlow();
    if (authFlow !== 'reset') {
      // If not in reset flow, redirect to forgot password
      // router.push('/auth/forgot-password');
    }
  }, [getAuthFlow]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): string | null => {
    if (!formData.password) {
      return "Please enter a password";
    }
    if (formData.password.length < 6) {
      return "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      return "Passwords do not match";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await setPassword(formData.password);

      if (result.success) {
        // Password set successfully, redirect to login
        router.push("/auth/login");
      } else {
        setLocalError(result.message);
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to set password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <>
      <DefaultNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[url('/background.svg')] bg-cover">
        <div className="w-full max-w-[448px] bg-white/95 border border-slate-200 rounded-3xl shadow-xl backdrop-blur-md px-6 py-10 sm:px-10 relative">
          {/* Logo */}
          <div className="flex justify-center mb-6 mt-2">
            <div className="w-20 h-20 relative flex items-center justify-center rounded-2xl bg-[#0045DD] shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] overflow-hidden">
              <Image
                src="/logowakanda1-nopad.svg"
                alt="Wakanda Logo"
                fill
                priority
                className="object-contain p-2"
              />
            </div>
          </div>
          {/* Heading */}
          <div className="mt-6 text-center">
            <h1 className="text-[30px] leading-9 font-bold text-[#0F1729]" style={{ fontFamily: "Segoe UI" }}>
              Set New Password
            </h1>
            <p className="mt-2 text-base text-[#65758B]" style={{ fontFamily: "Inter" }}>
              Create a new password for your account
            </p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F1729]">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="*************"
                  className="w-full h-[53px] pl-12 pr-10 rounded-[20px] border border-[#E1E7EF] text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD]"
                  value={formData.password}
                  onChange={handleChange}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </span>
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                  role="button"
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F1729]">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="*************"
                  className="w-full h-[53px] pl-12 pr-10 rounded-[20px] border border-[#E1E7EF] text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD]"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={20} />
                </span>
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer"
                  onClick={() => setShowConfirmPassword((show) => !show)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                  role="button"
                >
                  {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </span>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="text-sm text-[#65758B]">
              <p>Password must:</p>
              <ul className="list-disc list-inside ml-2 mt-1">
                <li className={formData.password.length >= 6 ? "text-green-600" : ""}>
                  Be at least 6 characters long
                </li>
              </ul>
            </div>

            {/* Error Message */}
            {displayError && (
              <p className="text-red-500 text-center text-sm">{displayError}</p>
            )}

            {/* Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#0045DD] text-white rounded-xl shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] text-lg font-semibold hover:bg-[#003bb8] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? "Setting Password..." : <>Confirm <ArrowRight size={20} /></>}
            </button>
          </form>
          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[#0045DD] cursor-pointer hover:underline" onClick={() => router.push('/auth/login')}>
            Back to Login
          </p>
        </div>
      </div>
    </>
  );
}

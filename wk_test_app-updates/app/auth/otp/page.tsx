"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DefaultNavbar from "@/components/DefaultNavbar";
import { Pencil, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function OtpVerification() {
  const { t } = useTranslation();
  const router = useRouter();
  const { 
    verifyOTP, 
    resendOTP,
    signup, 
    getAuthFlow, 
    getPhoneForReset, 
    getSignupData,
    loading, 
    error, 
    clearError 
  } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [phone, setPhone] = useState("");
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Get phone from session
  useEffect(() => {
    const storedPhone = getPhoneForReset();
    if (storedPhone) {
      setPhone(storedPhone);
    }
  }, [getPhoneForReset]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if value entered
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      if (next) (next as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      if (prev) (prev as HTMLInputElement).focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split('').forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    const code = otp.join("");
    if (code.length !== 6) {
      setLocalError("Please enter the 6-digit OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Verify OTP with backend
      const verifyResult = await verifyOTP(code);

      if (verifyResult.success) {
        const authFlow = getAuthFlow();
        
        if (authFlow === 'signup') {
          // Complete signup after OTP verification
          const signupData = getSignupData();
          if (signupData) {
            const signupResult = await signup(signupData);
            if (signupResult.success) {
              router.push("/Views/quiz-mode");
            } else {
              setLocalError(signupResult.message);
            }
          } else {
            router.push("/Views/quiz-mode");
          }
        } else if (authFlow === 'reset') {
          // Navigate to set password page
          router.push("/auth/set-password");
        } else {
          // Default navigation
          router.push("/Views/quiz-mode");
        }
      } else {
        setLocalError(verifyResult.message);
      }
    } catch (err: any) {
      setLocalError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setCanResend(false);
    setResendTimer(60);
    setLocalError("");
    
    try {
      const result = await resendOTP();
      if (!result.success) {
        setLocalError(result.message);
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to resend OTP");
    }
  };

  const displayError = localError || error;

  return (
    <>
      <DefaultNavbar />
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[url('/background.svg')] bg-cover">
        <div className="w-full max-w-[540px] bg-white/95 border border-slate-200 rounded-3xl shadow-xl backdrop-blur-md px-6 py-10 sm:px-10 relative">
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
              Confirm OTP
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <span className="text-base text-[#65758B]" style={{ fontFamily: 'Inter' }}>
                OTP has been sent to
              </span>
              <span className="text-base text-[#0045DD] font-semibold underline">{phone || "______"}</span>
              <button
                type="button"
                className="ml-2 p-1 rounded text-[#0045DD] underline hover:bg-slate-100"
                aria-label="Edit phone number"
                onClick={() => router.back()}
              >
                <span style={{ textDecoration: 'underline' }}><Pencil size={18} /></span>
              </button>
            </div>
          </div>
          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            <div className="flex justify-center gap-3 sm:gap-4 md:gap-5 lg:gap-6 w-full">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-10 sm:w-12 md:w-14 lg:w-[57px] h-12 sm:h-[53px] text-center rounded-[20px] border border-[#E1E7EF] text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD]"
                  value={digit}
                  onChange={e => handleChange(idx, e.target.value)}
                  onKeyDown={e => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Error Message */}
            {displayError && (
              <p className="text-red-500 text-center text-sm">{displayError}</p>
            )}

            {/* Resend OTP */}
            <div className="text-center">
              {canResend ? (
                <button
                  type="button"
                  className="text-sm text-[#0045DD] hover:underline"
                  onClick={handleResendOTP}
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-sm text-[#65758B]">
                  Resend OTP in {resendTimer}s
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#0045DD] text-white rounded-xl shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] text-lg font-semibold hover:bg-[#003bb8] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? "Verifying..." : <>Verify <ArrowRight size={20} /></>}
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

"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DefaultNavbar from "@/components/DefaultNavbar";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Phone, ChevronDown, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const router = useRouter();
  const { sendOTP, setAuthFlow, setPhoneForReset, loading, error, clearError } = useAuth();

  const [phone, setPhone] = useState("");
  const countryOptions = [
    { code: "+224", short: "GN" },
    { code: "+91", short: "IN" },
  ];
  const [country, setCountry] = useState(countryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [localError, setLocalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!phone.trim()) {
      setLocalError("Please enter your phone number");
      return;
    }
    if (phone.length < 8) {
      setLocalError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Set auth flow to reset
      setAuthFlow('reset');
      
      // Store phone for later use
      const fullPhone = `${country.code}${phone}`;
      setPhoneForReset(fullPhone);

      // Send OTP via backend API
      const otpResult = await sendOTP(phone, country.code);

      if (otpResult.success) {
        router.push("/auth/verify-otp");
      } else {
        setLocalError(otpResult.message);
      }
    } catch (err: any) {
      setLocalError(err.message || "Failed to send OTP. Please try again.");
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
              Reset Your Password
            </h1>
            <p className="mt-2 text-base text-[#65758B]" style={{ fontFamily: "Inter" }}>
              Enter your phone number to reset your password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0F1729]">Phone Number</label>
              <div className="flex w-full h-[53px] bg-white border border-[#E1E7EF] rounded-[20px] relative">
                {/* Country Code Dropdown */}
                <div className="relative h-full" ref={dropdownRef}>
                  <button
                    type="button"
                    className="flex items-center justify-center px-4 h-full text-base text-black bg-white focus:outline-none min-w-[90px] rounded-l-[20px] border-r border-[#E1E7EF]"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="mr-1">{country.short} {country.code}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[160px] bg-white border border-[#0045DD] rounded-xl shadow-2xl z-50 overflow-hidden">
                      <ul className="py-1">
                        {countryOptions.map((option) => (
                          <li
                            key={option.code}
                            className="flex items-center px-4 py-2 cursor-pointer hover:bg-slate-50 text-black transition-colors"
                            onClick={() => {
                              setCountry(option);
                              setDropdownOpen(false);
                            }}
                          >
                            {option.short} ({option.code})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                {/* Phone Input Field */}
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={20} />
                  </span>
                  <input
                    type="tel"
                    placeholder="1234567890"
                    className="w-full h-full pl-10 pr-4 text-base text-black bg-transparent focus:outline-none rounded-r-[20px]"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {displayError && (
              <p className="text-red-500 text-center text-sm">{displayError}</p>
            )}

            {/* Send Code Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#0045DD] text-white rounded-xl shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] text-lg font-semibold hover:bg-[#003bb8] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? "Sending..." : <>Send Code <ArrowRight size={20} /></>}
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

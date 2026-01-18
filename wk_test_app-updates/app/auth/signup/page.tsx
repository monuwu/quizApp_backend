"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ArrowRight, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Phone, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/context/AuthContext";

// Validation Schema
const signupSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .required("Full name is required"),
  phone_number: Yup.string()
    .matches(/^[0-9]+$/, "Phone number must contain only digits")
    .min(8, "Phone number must be at least 8 digits")
    .max(15, "Phone number must be less than 15 digits")
    .required("Phone number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password must be less than 50 characters")
    .required("Password is required"),
  confirm_password: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

// Country options
const countryOptions = [
  { code: "+224", short: "GN" },
  { code: "+91", short: "IN" },
];

export default function Signup() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signup, loading, error, clearError } = useAuth();

  const [country, setCountry] = useState(countryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: "",
      phone_number: "",
      password: "",
      confirm_password: "",
    },
    validationSchema: signupSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitError("");

      try {
        // Call signup API directly with all fields
        const signupResult = await signup({
          name: values.name,
          country_code: country.code,
          phone_number: values.phone_number,
          password: values.password,
          confirm_password: values.confirm_password,
        });

        if (signupResult.success) {
          router.push("/Views/quiz-mode");
        } else {
          setSubmitError(signupResult.message);
        }
      } catch (err: any) {
        setSubmitError(err.message || "Failed to signup. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Clear errors on mount
  useEffect(() => {
    clearError();
  }, [clearError]);

  const displayError = submitError || error;
  const isSubmitting = formik.isSubmitting || loading;

  // Helper to check if field has error
  const hasError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field];

  return (
    <>
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
            <h1
              className="text-[30px] leading-9 font-bold text-[#0F1729]"
              style={{ fontFamily: "Segoe UI" }}
            >
              Ready to Test Your Knowledge?
            </h1>
            <p className="mt-2 text-base text-[#65758B]" style={{ fontFamily: "Inter" }}>
              Signup to create your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="mt-10 space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-[#0F1729]">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={`w-full h-[53px] pl-12 pr-4 rounded-[20px] border text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD] ${hasError("name") ? "border-red-500" : "border-[#E1E7EF]"
                    }`}
                  {...formik.getFieldProps("name")}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={20} />
                </span>
              </div>
              {hasError("name") && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone_number" className="text-sm font-medium text-[#0F1729]">
                Phone Number
              </label>
              <div className="flex w-full">
                <div
                  className={`flex w-full h-[53px] bg-white border rounded-[20px] relative ${hasError("phone_number") ? "border-red-500" : "border-[#E1E7EF]"
                    }`}
                >
                  {/* Country Code Dropdown */}
                  <div className="relative h-full" ref={dropdownRef}>
                    <button
                      type="button"
                      className="flex items-center justify-center px-4 h-full text-base text-black bg-white focus:outline-none min-w-[90px] rounded-l-[20px] border-r border-[#E1E7EF]"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span className="mr-1">
                        {country.short} {country.code}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
                          }`}
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
                  <div className="relative flex-1 flex items-center">
                    <span className="absolute left-3 text-slate-400">
                      <Phone size={20} />
                    </span>
                    <input
                      id="phone_number"
                      type="tel"
                      placeholder="1234567890"
                      className="w-full h-full pl-10 pr-4 text-base text-black bg-transparent focus:outline-none rounded-r-[20px]"
                      {...formik.getFieldProps("phone_number")}
                    />
                  </div>
                </div>
              </div>
              {hasError("phone_number") && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.phone_number}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0F1729]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="*************"
                  className={`w-full h-[53px] pl-12 pr-10 rounded-[20px] border text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD] ${hasError("password") ? "border-red-500" : "border-[#E1E7EF]"
                    }`}
                  {...formik.getFieldProps("password")}
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
              {hasError("password") && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirm_password" className="text-sm font-medium text-[#0F1729]">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="*************"
                  className={`w-full h-[53px] pl-12 pr-10 rounded-[20px] border text-base text-black focus:outline-none focus:ring-2 focus:ring-[#0045DD] ${hasError("confirm_password") ? "border-red-500" : "border-[#E1E7EF]"
                    }`}
                  {...formik.getFieldProps("confirm_password")}
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
              {hasError("confirm_password") && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.confirm_password}</p>
              )}
            </div>

            {/* Error Message */}
            {displayError && <p className="text-red-500 text-center text-sm">{displayError}</p>}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formik.isValid}
              className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#0045DD] text-white rounded-xl shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] text-lg font-semibold hover:bg-[#003bb8] transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Creating Account..."
              ) : (
                <>
                  Signup <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-[#65758B]">
            Have an account?{" "}
            <span
              className="text-[#0045DD] cursor-pointer hover:underline"
              onClick={() => router.push("/auth/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </>
  );
}

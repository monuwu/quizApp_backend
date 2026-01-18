"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, Lock, EyeOff, Eye, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import questionsData from "@/data/questions.json";


export default function Hero() {
  const router = useRouter();
  
  // 1. Initialize the Ref
  const dropdownRef = useRef<HTMLDivElement>(null); 

  const [formData, setFormData] = useState({ phone: "", password: "" });
  const countryOptions = [
    { code: "+224", short: "GN" },
    { code: "+91", short: "IN" },
  ];
  const [country, setCountry] = useState(countryOptions[0]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Safety check for questionsData in case file is empty
  const totalQuestions = questionsData?.length || 0;
  const timeLimit = 10;

  // 2. Fixed Click Outside Logic
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/quiz-mode");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-[448px] bg-white/95 border border-slate-200 rounded-3xl shadow-xl backdrop-blur-md px-6 py-10 sm:px-10">
        
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
          <h1 className="text-[30px] leading-9 font-bold text-[#0F1729]">
            Ready to Test Your Knowledge?
          </h1>
          <p className="mt-2 text-base text-[#65758B]">
            Login to begin the assessment
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          
          {/* Phone Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F1729]">Phone Number</label>

            {/* 3. Removed overflow-hidden so dropdown can pop out */}
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0F1729]">Password</label>
            
            {/* 4. Fixed broken HTML structure here */}
            <div className="relative h-[53px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Lock size={20} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="************"
                className="w-full h-full pl-12 pr-12 text-base text-black bg-white border border-[#E1E7EF] rounded-[20px] focus:outline-none focus:border-[#0045DD]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button 
              type="button"
              className="text-sm text-[#0045DD] hover:underline" 
              onClick={() => router.push('/reset-password')}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-[60px] flex items-center justify-center gap-2 bg-[#0045DD] text-white rounded-xl shadow-[0_0_40px_-8px_rgba(0,69,221,0.4)] text-lg font-semibold hover:bg-[#003bb8] active:scale-[0.98] transition-all"
          >
            Login →
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-[#65758B]">
            Don’t have an account?{" "}
            <button 
              className="text-[#0045DD] font-semibold hover:underline" 
              onClick={() => router.push('/signup')}
            >
              Create Account
            </button>
          </p>

          <div className="flex justify-center gap-2 text-sm text-[#65758B] text-[12px]">
            <span>{totalQuestions} questions</span>
            <span>•</span>
            <span>{timeLimit} minutes</span>
            <span>•</span>
            <span>Instant results</span>
          </div>
        </div>
      </div>
    </div>
  );
}
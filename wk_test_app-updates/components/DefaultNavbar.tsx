"use client";

import React, { useState, useEffect } from "react";
import { useTranslationContext } from "../context/TranslationContext";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
];

export default function QuizModeNavbar() {
  const { language, setLanguage } = useTranslationContext();
  const [dropdown, setDropdown] = useState(false);
  // Keep local label in sync with context
  const lang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 flex flex-col items-start px-5 w-full h-[68.8px] bg-[#F8FAFCCC] border-b-[0.8px] border-[#E1E7EF] z-50 flex-none order-0 self-stretch">
      <div className="flex flex-row justify-between items-center py-3 px-4 w-full max-w-350 h-17 flex-none order-0 self-stretch mx-auto">
        {/* Logo Section */}
        <div className="flex flex-row items-center p-0 gap-2 w-55.25 h-8 flex-none order-0">
          <div className="w-8 h-8 bg-white flex-none order-0">
            <Image
              src="/logowakanda.svg"
              alt="Wakanda Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-start p-0 w-45.25 h-7 flex-none order-1">
            <h1 className="w-45.25 h-7 font-bold text-[18px] leading-7 flex items-center text-[#0F1729] flex-none order-0 whitespace-nowrap" style={{ fontFamily: 'Segoe UI' }}>
              Wakanda QuizMaster
            </h1>
          </div>
        </div>
        {/* Language Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 bg-transparent border-none rounded focus:outline-none text-base font-medium text-[#65758B] hover:bg-slate-100"
            onClick={() => setDropdown((d) => !d)}
            style={{ minWidth: 90 }}
          >
            <Image
              src="/Globe.svg"
              alt="Globe Icon"
              width={20}
              height={20}
              className="object-contain mr-1"
            />
            <span className="text-[#65758B] font-medium text-base">{lang.label}</span>
            <ChevronDown size={18} className={`ml-1 text-[#65758B] transition-transform ${dropdown ? 'rotate-180' : ''}`} />
          </button>
          {dropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-[#0045DD] rounded-xl shadow-2xl z-50 overflow-hidden">
              <ul className="py-1">
                {LANGUAGES.map((option) => (
                  <li
                    key={option.code}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-50 text-black"
                    onClick={() => { setLanguage(option.code as "en" | "fr"); setDropdown(false); }}
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

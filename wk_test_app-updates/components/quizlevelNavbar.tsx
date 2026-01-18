"use client";

import React, { useState, useEffect } from "react";
import { useTranslationContext } from "../context/TranslationContext";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface NavbarProps {
  showTimer?: boolean;
  showTotalEarned?: boolean;
  totalPoints?: number;
  timer?: number;
}

export default function Navbar({ showTimer = false, showTotalEarned = false, totalPoints = 20, timer }: NavbarProps) {
  const [currentTime, setCurrentTime] = useState("00:00");

  useEffect(() => {
    if (!showTimer) {
      const updateTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        setCurrentTime(`${hours}:${minutes}`);
      };
      updateTime();
      const interval = setInterval(updateTime, 1000);
      return () => clearInterval(interval);
    }
  }, [showTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const displayTime = showTimer && typeof timer === "number" ? formatTime(timer) : currentTime;
  const timerTextColor = showTimer && typeof timer === "number" && timer <= 120 ? "text-red-600" : "text-[#0F1729]";

  const { language, setLanguage } = useTranslationContext();
  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "fr", label: "French" },
  ];
  const [dropdown, setDropdown] = useState(false);
  const lang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 flex flex-col items-start px-2 sm:px-5 w-full h-auto min-h-[68.8px] bg-[#F8FAFCCC] border-b-[0.8px] border-[#E1E7EF] z-50 flex-none order-0 self-stretch">
      <div className="flex flex-wrap flex-row justify-between items-center py-3 px-2 sm:px-4 w-full max-w-5xl min-h-[68px] gap-2 sm:gap-4 mx-auto">
        {/* Logo Section */}
        <div className="flex flex-row items-center p-0 gap-2 w-auto h-8 flex-none order-0 min-w-[120px]">
          {/* Logo Icon */}
          <div className="w-8 h-8 bg-white flex-none order-0">
            <Image
              src="/logowakanda.svg"
              alt="Wakanda Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>

          {/* Title */}
          <div className="flex flex-col items-start p-0 w-auto h-7 flex-none order-1">
            <h1 className="font-bold text-[18px] leading-7 flex items-center text-[#0F1729] flex-none order-0 whitespace-nowrap" style={{ fontFamily: 'Segoe UI' }}>
              Wakanda QuizMaster
            </h1>
          </div>
        </div>

        {/* Timer Section */}
        {showTimer && (
          <div className="flex flex-row items-center py-2 px-3 sm:px-4 gap-2 w-auto min-w-[120px] h-11 bg-[#F1F5F9] rounded-[20px] flex-none order-1">
            <svg
              className="w-5 h-5 flex-none order-0"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="10"
                cy="10"
                r="8.33333"
                stroke="#0F1729"
                strokeWidth="1.66667"
              />
              <path
                d="M10 5V10L13.3333 11.6667"
                stroke="#0F1729"
                strokeWidth="1.66667"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-start p-0 w-12.5 h-7 flex-none order-1">
              <span
                className={`w-12.5 h-7 font-bold text-[18px] leading-7 flex items-center ${timerTextColor} flex-none order-0 font-mono`}
                style={{ fontFamily: 'Consolas' }}
              >
                {displayTime}
              </span>
            </div>
          </div>
        )}

        {/* Total Earned Section */}
        {showTotalEarned && (
          <div className="flex flex-row items-center py-2 px-3 sm:px-4 gap-2 w-auto min-w-[180px] h-10 bg-linear-to-r from-[#E7B008] to-[#FF9900] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] rounded-[20px] flex-none order-2">
            <span className="font-semibold text-base leading-6 flex items-center text-white flex-none order-0" style={{ fontFamily: 'Inter' }}>
              Total Earned:
            </span>
            <Image
              src="/trophy.svg"
              alt="Points"
              width={20}
              height={20}
              className="flex-none order-1"
            />
            <span className="font-semibold text-base leading-6 flex items-center text-white flex-none order-2" style={{ fontFamily: 'Inter' }}>
              {totalPoints} pts
            </span>
          </div>
        )}

        {/* Translation Option - separate, neat style */}
        <div className="relative flex-none order-3 ml-0 sm:ml-2">
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
            <div className="absolute right-0 mt-2 w-32 bg-white border border-[#E1E7EF] rounded-xl shadow-2xl z-50 overflow-hidden">
              <ul className="py-1">
                {LANGUAGES.map((option) => (
                  <li
                    key={option.code}
                    className="px-4 py-2 cursor-pointer hover:bg-slate-50 text-[#0F1729]"
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

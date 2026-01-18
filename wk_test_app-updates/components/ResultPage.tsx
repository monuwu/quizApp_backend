"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { apiFetch } from "../utils/api";

interface ResultPageProps {
  score?: number;
  totalPoints?: number;
  passingPercentage?: number;
  timeup?: boolean;
}

export default function ResultPage({
  score: initialScore = 65,
  totalPoints: initialTotalPoints = 100,
  passingPercentage = 70,
  timeup = false,
}: ResultPageProps) {
  const router = useRouter();

  // Example: get token from localStorage (or Context, etc.)
  const [score, setScore] = useState(initialScore);
  const [totalPoints, setTotalPoints] = useState(initialTotalPoints);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const percentage = Math.round((score / totalPoints) * 100);
  const isPassed = timeup ? false : percentage >= passingPercentage;

  const handleRetryQuiz = () => {
    router.push("/quiz");
  };

  const handleBackToHome = () => {
    router.push("/");
  };

  useEffect(() => {
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace with your actual token retrieval logic
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No token found. Please log in.");
          setLoading(false);
          return;
        }
        // Replace with your actual API endpoint
        const data = await apiFetch<{ score: number; totalPoints: number }>(
          "http://localhost:5000/api/results/latest",
          {},
          token
        );
        setScore(data.score);
        setTotalPoints(data.totalPoints);
      } catch (err: any) {
        setError(err.message || "Failed to fetch result");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  return (
    <div className="flex flex-col items-start p-0 w-full min-h-screen flex-none order-1 self-stretch">
      {loading && (
        <div className="w-full flex justify-center items-center mt-10 text-lg">Loading result...</div>
      )}
      {error && (
        <div className="w-full flex justify-center items-center mt-10 text-red-600">{error}</div>
      )}
      <div className="flex flex-row justify-center items-center py-8 sm:py-16 md:py-[147.6px] px-4 w-full min-h-screen flex-none order-0 self-stretch">
        <div className="flex flex-col items-start p-0 w-full max-w-md sm:w-[448px] flex-none order-0">
          {/* Result Card */}
          <div className="relative w-full sm:w-[448px] min-h-[564px] bg-white/95 border border-[rgba(225,231,239,0.5)] shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.12)] backdrop-blur-[12px] rounded-[24px] flex-none order-0 self-stretch px-6 sm:px-0">
            {/* Header Section with Emoji */}
            <div className="absolute h-[164px] left-[41px] right-[41px] top-[40px]">
              {/* Crying Emoji */}
              <div className="absolute w-[70px] h-[84px] left-1/2 -translate-x-1/2 -top-[5.6px] flex items-center justify-center text-[70px]">
                {isPassed ? "🎉" : "😢"}
              </div>

              {/* Heading and Subtitle */}
              <div className="absolute w-full left-0 right-0 top-[80.4px] flex flex-col items-start gap-3">
                {/* Heading */}
                <div className="flex flex-col items-center w-full">
                  <h1
                    className="font-bold text-2xl sm:text-[30px] leading-9 flex items-center text-center text-[#0F1729]"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    {isPassed ? "Congratulations!🎉" : "Don't Give Up!"}
                  </h1>
                </div>

                {/* Subtitle */}
                <div className="flex flex-col items-center w-full">
                  <p
                    className="font-normal text-sm sm:text-base leading-6 flex items-center text-center text-[#65758B] px-4 sm:px-0"
                    style={{ fontFamily: "Inter" }}
                  >
                    {isPassed
                      ? `You've passed the assessment!`  //`You scored above ${passingPercentage}%! Great job!`
                      : `You need ${passingPercentage}% to pass. Let's try again!`}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Section with Buttons */}
            <div className="absolute left-[40.8px] right-[40.8px] top-[227.4px] flex flex-col items-start gap-5">
              {/* Score Display Box */}
              <div
                className={`flex flex-col justify-center items-center py-4 gap-2 w-full h-[120px] rounded-xl ${
                  isPassed
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <div className="flex flex-row justify-center items-start gap-2">
                  {/* Emoji Icon */}
                  <div className="w-8 h-8 flex items-center justify-center">
                    {isPassed ? (
                      <Image
                        src="/trophy1.svg"
                        alt="Trophy"
                        width={32}
                        height={32}
                      />
                    ) : (
                      <Image
                        src="/sad.svg"
                        alt="Trophy"
                        width={32}
                        height={32}
                      />
                    )}
                  </div>

                  {/* Percentage */}
                  <span
                    className={`font-semibold text-[28px] leading-7 flex items-center text-center ${
                      isPassed ? "text-green-600" : "text-[#FF3B30]"
                    }`}
                    style={{ fontFamily: "Inter" }}
                  >
                    {percentage}%
                  </span>
                </div>

                {/* Score Text */}
                <p
                  className="font-normal text-base leading-6 flex items-center text-center text-[#65758B]"
                  style={{ fontFamily: "Inter" }}
                >
                  Score: {score}/{totalPoints} points
                </p>
              </div>

              {/* Conditional Button - Download or Retry */}
              {isPassed ? (
                <button
                  onClick={() => router.push("/download")}
                  className="flex flex-row justify-center items-center py-4 gap-2 w-full h-[60px] bg-[#0045DD] shadow-[0px_0px_40px_-8px_rgba(0,69,221,0.4)] rounded-xl hover:bg-[#003BB8] transition-colors"
                >
                  <Image
                        src="/download.svg"
                        alt="Trophy"
                        width={20}
                        height={20}
                      />
                  <span
                    className="font-semibold text-lg leading-7 flex items-center text-center text-white"
                    style={{ fontFamily: "Inter" }}
                  >
                    Download Certificate
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleRetryQuiz}
                  className="flex flex-row justify-center items-center py-4 gap-2 w-full h-[60px] bg-[#0045DD] shadow-[0px_0px_40px_-8px_rgba(0,69,221,0.4)] rounded-xl hover:bg-[#003BB8] transition-colors"
                >
                  <Image
                        src="/retry.svg"
                        alt="Trophy"
                        width={20}
                        height={20}
                      />
                  <span
                    className="font-semibold text-lg leading-7 flex items-center text-center text-white"
                    style={{ fontFamily: "Inter" }}
                  >
                    Retry Quiz
                  </span>
                </button>
              )}

              {/* Back to Home Button */}
              <button
                onClick={handleBackToHome}
                className="flex flex-row justify-center items-center py-4 gap-2 w-full h-[60px] bg-[#D9D9D9] rounded-xl hover:bg-[#C9C9C9] transition-colors"
              >
                <Image
                        src="/backarrow.svg"
                        alt="Trophy"
                        width={20}
                        height={20}
                      />
                <span
                  className="font-semibold text-lg leading-7 flex items-center text-center text-[#0F1729]"
                  style={{ fontFamily: "Inter" }}
                >
                  Back to Home
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

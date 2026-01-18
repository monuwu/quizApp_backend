"use client";

import React, { useState } from "react";
import tickSvg from "@/public/tick.svg";
import wrongSvg from "@/public/wrong.svg";
import Image from "next/image";

interface Answer {
  id: string;
  letter: string;
  text: string;
}


interface QuestionPageProps {
  questionNumber?: number;
  totalQuestions?: number;
  points?: number;
  question?: string;
  answers?: Answer[];
  correctAnswerId?: string;
  onAnswer?: (isCorrect: boolean, points: number) => void;
  autoNextDelay?: number; // ms
}


export default function QuestionPage({
  questionNumber = 3,
  totalQuestions = 8,
  points = 15,
  question = "What is the largest mammal in the world?",
  answers = [
    { id: "a", letter: "A", text: "African Elephant" },
    { id: "b", letter: "B", text: "Blue Whale" },
    { id: "c", letter: "C", text: "Giraffe" },
    { id: "d", letter: "D", text: "Polar Bear" },
  ],
  correctAnswerId,
  onAnswer,
  autoNextDelay = 1200,
}: QuestionPageProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [animation, setAnimation] = useState<"correct" | "wrong" | null>(null);
  const progress = (questionNumber / totalQuestions) * 100;

  // Handle answer selection
  const handleSelect = (answerId: string) => {
    if (selectedAnswer) return; // Prevent double click
    setSelectedAnswer(answerId);
    const isCorrect = answerId === correctAnswerId;
    setAnimation(isCorrect ? "correct" : "wrong");
    if (onAnswer) onAnswer(isCorrect, isCorrect ? points : 0);
    // Auto-advance after delay
    setTimeout(() => {
      setAnimation(null);
      setSelectedAnswer(null);
    }, autoNextDelay);
  };

  return (
    <div className="flex flex-col items-start px-3 sm:px-5 w-full min-h-screen flex-none order-1 self-stretch z-0 relative">
      {/* Animation Overlay */}
      {animation === "correct" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none animate-fade-in">
          <Image src="/tick.svg" alt="Correct" width={80} height={80} className="mb-2 animate-bounce" />
          <Image src="/happy1.svg" alt="Happy" width={60} height={60} className="animate-fade-in" />
        </div>
      )}
      {animation === "wrong" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none animate-fade-in">
          <Image src="/wrong.svg" alt="Wrong" width={80} height={80} className="mb-2 animate-shake" />
          <Image src="/sad.svg" alt="Sad" width={60} height={60} className="animate-fade-in" />
        </div>
      )}
      <div className="flex flex-row justify-center items-center py-8 sm:py-16 md:py-[134.4px] px-2 sm:px-4 w-full max-w-350 min-h-screen flex-none order-0 self-stretch mx-auto">
        <div className="flex flex-col items-start p-0 gap-4 sm:gap-6 w-full sm:w-2xl max-w-2xl flex-none order-0">
          {/* Header Section */}
          <div className="flex flex-col items-start p-0 gap-2 w-full min-h-12 flex-none order-0 self-stretch">
            {/* Question Counter and Points */}
            <div className="flex flex-row justify-between items-center p-0 w-full h-8 flex-none order-0 self-stretch">
              {/* Question Counter */}
              <div className="flex flex-col items-start p-0 shrink-0 flex-none order-0">
                <span
                  className="font-medium text-xs sm:text-sm leading-5 flex items-center text-[#65758B] flex-none order-0 whitespace-nowrap"
                  style={{ fontFamily: "Inter" }}
                >
                  Question {questionNumber} of {totalQuestions}
                </span>
              </div>

              {/* Points Badge */}
              <div className="flex flex-row items-center py-1.5 px-2 sm:px-3 gap-1.5 h-8 bg-linear-to-r from-[#E7B008] to-[#FF9900] rounded-2xl flex-none order-1">
                <Image
                  src="/points.svg"
                  alt="Points"
                  width={16}
                  height={16}
                  className="flex-none order-0"
                />
                <span
                  className="font-semibold text-xs sm:text-sm leading-5 flex items-center text-white flex-none order-1 whitespace-nowrap"
                  style={{ fontFamily: "Inter" }}
                >
                  {points} pts
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-[#F1F5F9] rounded-full flex-none order-1 self-stretch">
              <div
                className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-[#0045DB] to-[#1A3CFF] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="flex flex-col items-start p-4 sm:p-6 md:p-[31.8px] w-full min-h-[97.6px] bg-white/95 border border-[rgba(225,231,239,0.5)] shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md rounded-2xl sm:rounded-4xl flex-none order-1 self-stretch">
            <div className="flex flex-col items-start p-0 w-full flex-none order-0">
              <h2
                className="font-bold text-lg sm:text-xl md:text-2xl leading-6 sm:leading-7 md:leading-8 flex items-center text-[#0F1729] flex-none order-0"
                style={{ fontFamily: "Segoe UI" }}
              >
                {question}
              </h2>
            </div>
          </div>

          {/* Answer Options */}
          <div className="flex flex-col items-start p-0 gap-2 sm:gap-3 w-full flex-none order-2 self-stretch">
            {answers.map((answer, index) => {
              let btnState = "";
              if (selectedAnswer) {
                if (answer.id === selectedAnswer) {
                  btnState =
                    answer.id === correctAnswerId
                      ? "border-green-500 bg-green-50 animate-pulse"
                      : "border-red-500 bg-red-50 animate-shake";
                } else if (answer.id === correctAnswerId) {
                  btnState = "border-green-500 bg-green-50";
                }
              }
              return (
                <button
                  key={answer.id}
                  onClick={() => handleSelect(answer.id)}
                  disabled={!!selectedAnswer}
                  className={`flex flex-row items-center p-3 sm:p-4 md:p-[20.6px] gap-2 sm:gap-3 md:gap-4 w-full min-h-15 sm:min-h-17.5 md:min-h-[83.2px] bg-white border rounded-xl sm:rounded-2xl md:rounded-3xl flex-none self-stretch transition-all hover:border-[#0045DD] hover:shadow-md ${
                    selectedAnswer === answer.id
                      ? "border-[#0045DD] border-2 shadow-md"
                      : "border-[#E1E7EF]"
                  } ${btnState}`}
                  style={{ order: index }}
                >
                  {/* Letter Badge */}
                  <div
                    className={`flex flex-row justify-center items-center p-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-2xl flex-none order-0 transition-colors ${
                      selectedAnswer === answer.id
                        ? "bg-[#0045DD]"
                        : "bg-[#F1F5F9]"
                    }`}
                  >
                    <span
                      className={`font-semibold text-sm sm:text-base leading-5 sm:leading-6 flex items-center text-center flex-none order-0 ${
                        selectedAnswer === answer.id
                          ? "text-white"
                          : "text-[#0F1729]"
                      }`}
                      style={{ fontFamily: "Inter" }}
                    >
                      {answer.letter}
                    </span>
                  </div>

                  {/* Answer Text */}
                  <div className="flex flex-col items-start p-0 flex-none order-1 grow">
                    <span
                      className="font-medium text-sm sm:text-base leading-5 sm:leading-6 flex items-center text-[#0F1729] flex-none order-0 self-stretch"
                      style={{ fontFamily: "Inter" }}
                    >
                      {answer.text}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

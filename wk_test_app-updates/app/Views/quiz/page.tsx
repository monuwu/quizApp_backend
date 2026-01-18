
"use client";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import Navbar from "@/components/quizlevelNavbar";
import questionsData from "@/data/questions.json";

interface Answer {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  question: string;
  image: string;
  answers: Answer[];
  points: number;
}

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
    new Array(questionsData.length).fill(false)
  );
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [shakeAnswerId, setShakeAnswerId] = useState<string | null>(null);

  const questions: Question[] = questionsData;
  const currentQuestion = questions[currentQuestionIndex];


  // Timer - counts down from 5 minutes
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Toast reminder for 2 min left
  useEffect(() => {
    if (timer === 120) {
      toast.error("Only 2 minutes left! Hurry up!", { position: "top-center" });
    }
    if (timer === 0) {
      toast.error("Time is up! The test is over.", { position: "top-center" });
      // Redirect to results page after a short delay
      setTimeout(() => {
        router.push(`/results?points=${totalPoints}&timeup=true`);
      }, 2000);
    }
  }, [timer, totalPoints, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answerId: string) => {
    if (answeredQuestions[currentQuestionIndex]) return;

    setSelectedAnswer(answerId);
    const answer = currentQuestion.answers.find((a) => a.id === answerId);
    
    if (answer?.isCorrect) {
      setTotalPoints((prev) => prev + currentQuestion.points);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setShakeAnswerId(answerId);
      // Remove shake after animation completes
      setTimeout(() => setShakeAnswerId(null), 500);
    }

    setShowFeedback(true);

    // Mark question as answered
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    // Auto-advance to next question after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        // Quiz completed - navigate to results page
        router.push(`/results?points=${totalPoints + (answer?.isCorrect ? currentQuestion.points : 0)}`);
      }
    }, 2000);
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="h-screen overflow-hidden font-sans">
      <ToastContainer />
      <Navbar showTimer={true} showTotalEarned={true} totalPoints={totalPoints} timer={timer} />
      <div className="flex flex-col items-start px-5 w-full h-full flex-none order-1 self-stretch z-0 overflow-y-auto">
        <div className="flex flex-row justify-center items-center py-[134.4px] px-4 w-full max-w-350 flex-none order-0 self-stretch mx-auto">
          <div className="flex flex-col items-start p-0 gap-6 w-2xl max-w-2xl flex-none order-0">
            {/* Header Section */}
            <div className="flex flex-col items-start p-0 gap-2 w-full h-12 flex-none order-0 self-stretch">
              {/* Question Counter and Points */}
              <div className="flex flex-row justify-between items-center p-0 w-full h-8 flex-none order-0 self-stretch">
                {/* Question Counter */}
                <div className="flex flex-row items-center p-0 w-auto h-5 flex-none order-0">
                  <span
                    className="font-medium text-sm leading-5 flex items-center text-[#65758B] flex-none order-0"
                    style={{ fontFamily: "Inter" }}
                  >
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                </div>

                {/* Points Badge */}
                <div className="flex flex-row items-center py-1.5 px-3 gap-1.5 h-8 bg-linear-to-r from-[#E7B008] to-[#FF9900] rounded-2xl flex-none order-1">
                  <Image
                    src="/points.svg"
                    alt="Points"
                    width={16}
                    height={16}
                    className="flex-none order-0"
                  />
                  <span
                    className="font-semibold text-sm leading-5 flex items-center text-white flex-none order-1"
                    style={{ fontFamily: "Inter" }}
                  >
                    {currentQuestion.points} pts
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-[#F1F5F9] rounded-full flex-none order-1 self-stretch">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-linear-to-r from-[#0045DB] to-[#1A3CFF] rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="flex flex-col items-start p-[31.8px] w-full bg-white/95 border border-[rgba(225,231,239,0.5)] shadow-[0px_8px_24px_-8px_rgba(0,0,0,0.12)] backdrop-blur-md rounded-4xl flex-none order-1 self-stretch">
              <div className="flex flex-row items-start gap-4 w-full">
                {/* Question Text */}
                <div className="flex flex-col items-start p-0 flex-1">
                  <h2
                    className="font-bold text-2xl leading-8 flex items-center text-[#0F1729] flex-none order-0"
                    style={{ fontFamily: "Segoe UI" }}
                  >
                    {currentQuestion.question}
                  </h2>
                </div>
                
                {/* Feedback Icon */}
                {showFeedback && (
                  <div className="flex-none w-12 h-12 text-4xl flex items-center justify-center">
                    {isCorrect ? (
                      <div className="animate-single-bounce">😊</div>
                    ) : (
                      <div className="animate-single-bounce">😢</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Answer Options */}
            <div className="flex flex-col items-start p-0 gap-3 w-full flex-none order-2 self-stretch">
              {currentQuestion.answers.map((answer, index) => (
                <button
                  key={answer.id}
                  onClick={() => handleAnswerSelect(answer.id)}
                  disabled={answeredQuestions[currentQuestionIndex]}
                  className={`flex flex-row items-center p-[20.6px] gap-4 w-full h-[83.2px] bg-white border rounded-3xl flex-none self-stretch transition-all ${
                    answeredQuestions[currentQuestionIndex]
                      ? "cursor-not-allowed opacity-70"
                      : "hover:border-[#0045DD] hover:shadow-md cursor-pointer"
                  } ${
                    selectedAnswer === answer.id
                      ? answer.isCorrect
                        ? "border-green-500 border-2 bg-green-50"
                        : "border-red-500 border-2 bg-red-50"
                      : "border-[#E1E7EF]"
                  } ${
                    shakeAnswerId === answer.id ? "animate-shake" : ""
                  }`}
                  style={{ order: index }}
                >
                  {/* Letter Badge */}
                  <div
                    className={`flex flex-row justify-center items-center p-0 w-10 h-10 rounded-[20px] flex-none order-0 transition-colors ${
                      selectedAnswer === answer.id
                        ? answer.isCorrect
                          ? "bg-green-500"
                          : "bg-red-500"
                        : "bg-[#F1F5F9]"
                    }`}
                  >
                    <span
                      className={`font-semibold text-base leading-6 flex items-center text-center flex-none order-0 ${
                        selectedAnswer === answer.id ? "text-white" : "text-[#0F1729]"
                      }`}
                      style={{ fontFamily: "Inter" }}
                    >
                      {answer.letter}
                    </span>
                  </div>

                  {/* Answer Text */}
                  <div className="flex flex-col items-start p-0 h-6 flex-none order-1 grow">
                    <span
                      className="h-6 font-medium text-base leading-6 flex items-center text-[#0F1729] flex-none order-0 self-stretch"
                      style={{ fontFamily: "Inter" }}
                    >
                      {answer.text}
                    </span>
                  </div>

                  {/* Feedback Icon */}
                  {selectedAnswer === answer.id && (
                    <div className="flex-none w-6 h-6 order-2">
                      <Image
                        src={answer.isCorrect ? "/tick.svg" : "/wrong.svg"}
                        alt={answer.isCorrect ? "Correct" : "Wrong"}
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Feedback Bar */}
            {showFeedback && (
              <div
                className={`flex flex-row items-center justify-center p-4 gap-2 w-full rounded-3xl flex-none order-3 self-stretch transition-all ${
                  isCorrect
                    ? "bg-green-100 border border-green-200"
                    : "bg-red-100 border border-red-200"
                }`}
              >
                <span className="text-2xl">
                  {isCorrect ? "🎯" : "👎"}
                </span>
                <span
                  className={`font-semibold text-base leading-6 ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                  style={{ fontFamily: "Inter" }}
                >
                  {isCorrect
                    ? `Correct! +${currentQuestion.points} points`
                    : "Wrong answer"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

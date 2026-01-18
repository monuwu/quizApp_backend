"use client";
import QuizLevelNavbar from "@/components/quizlevelNavbar";
import DefaultNavbar from "@/components/DefaultNavbar";
import { usePathname } from "next/navigation";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";

// Context for quiz points
export const QuizPointsContext = createContext<{ totalPoints: number; setTotalPoints: (pts: number) => void }>({ totalPoints: 0, setTotalPoints: () => {} });

export function useQuizPoints() {
  return useContext(QuizPointsContext);
}

export default function LayoutWithNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isQuiz = pathname.startsWith("/quiz");
  const level = searchParams.get("level");

  // Timer and points state for quiz navbar (only for quiz question pages)
  const [timer, setTimer] = useState<number>(0);
  const [totalPoints, setTotalPoints] = useState<number>(0);

  useEffect(() => {
    if (isQuiz && level) {
      setTimer(300); // 5 min timer, adjust as needed
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isQuiz, level]);

  if (isQuiz && level) {
    return (
      <QuizPointsContext.Provider value={{ totalPoints, setTotalPoints }}>
        <QuizLevelNavbar showTimer={true} timer={timer} showTotalEarned={true} totalPoints={totalPoints} />
        {children}
      </QuizPointsContext.Provider>
    );
  }
  // For all other pages, show DefaultNavbar
  return (
    <>
      <DefaultNavbar />
      {children}
    </>
  );
}

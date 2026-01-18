"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/DefaultNavbar";
import ResultPage from "@/components/ResultPage";

function ResultContent() {
  const searchParams = useSearchParams();
  const points = parseInt(searchParams.get("points") || "0");
  const totalPoints = parseInt(searchParams.get("total") || "100");
  const timeup = searchParams.get("timeup") === "true";

  return <ResultPage score={points} totalPoints={totalPoints} timeup={timeup} />;
}

export default function ResultsPage() {
  return (
    <div className="h-screen overflow-hidden font-sans">
      <Navbar />
      <Suspense fallback={<div>Loading...</div>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}

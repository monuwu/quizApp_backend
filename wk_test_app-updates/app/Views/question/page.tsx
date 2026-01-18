import Navbar from "@/components/quizlevelNavbar";
import QuestionPage from "@/components/QuestionPage";

export default function Question() {
  return (
    <div className="h-screen overflow-hidden font-sans">
      <Navbar showTimer={true} showTotalEarned={true} totalPoints={20} />
      <QuestionPage />
    </div>
  );
}

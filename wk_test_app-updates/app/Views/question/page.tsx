
import Navbar from "@/components/quizlevelNavbar";
import QuestionPage from "@/components/QuestionPage";
import questionsData from "@/data/questions.json";
import { useTranslationContext } from "@/context/TranslationContext";

export default function Question() {
  const { language: rawLanguage } = useTranslationContext();
  // Robust fallback: only allow 'en' or 'fr', else fallback to 'en'
  const language = rawLanguage === 'fr' ? 'fr' : rawLanguage === 'en' ? 'en' : 'en';
  // For demo, use the first question. In real app, use state for current question.
  const question = questionsData[0];
  return (
    <div className="h-screen overflow-hidden font-sans">
      <Navbar showTimer={true} showTotalEarned={true} totalPoints={20} />
      <QuestionPage
        questionNumber={1}
        totalQuestions={questionsData.length}
        points={question.points}
        question={question.question}
        answers={question.answers}
        correctAnswerId={question.answers.find((a:any) => a.isCorrect)?.id}
        language={language}
      />
    </div>
  );
}

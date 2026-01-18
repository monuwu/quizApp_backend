import api from "@/utils/axios";

export async function fetchQuizQuestions(level: string) {
  // Get all quizzes for the level
  const quizzesRes = await api.get(`/quizzes?level=${level}`);
  if (!quizzesRes.data || !quizzesRes.data.data || quizzesRes.data.data.length === 0) {
    throw new Error("No quiz found for this level");
  }
  // Get the first quiz's details (with questions)
  const quizId = quizzesRes.data.data[0].id;
  const quizDetailRes = await api.get(`/quizzes/${quizId}`);
  return quizDetailRes.data.data;
}

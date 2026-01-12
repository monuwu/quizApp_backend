/**
 * Example: How to use Prisma in your services
 * 
 * You can now import prisma in any file and use it to query your database
 */

// Import the Prisma client
const prisma = require('../lib/prisma').default;

// Example 1: Get all active quizzes
async function getAllQuizzes() {
  const quizzes = await prisma.quiz.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return quizzes;
}

// Example 2: Get quiz by ID with questions and options
async function getQuizWithQuestions(quizId) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        include: {
          options: true
        },
        orderBy: {
          orderNumber: 'asc'
        }
      }
    }
  });
  return quiz;
}

// Example 3: Create a new quiz attempt
async function createQuizAttempt(quizId, userId, expirationTime) {
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      userId,
      expirationTime,
      status: 'in_progress'
    }
  });
  return attempt;
}

// Example 4: Update quiz attempt score
async function updateAttemptScore(attemptId, score, totalPoints, percentage) {
  const attempt = await prisma.quizAttempt.update({
    where: { id: attemptId },
    data: {
      score,
      totalPoints,
      percentage,
      status: 'completed',
      endTime: new Date()
    }
  });
  return attempt;
}

// Example 5: Create answer
async function createAnswer(attemptId, questionId, selectedOptionIds, isCorrect, pointsEarned) {
  const answer = await prisma.answer.create({
    data: {
      attemptId,
      questionId,
      selectedOptionIds,
      isCorrect,
      pointsEarned
    }
  });
  return answer;
}

// Example 6: Get all answers for an attempt
async function getAttemptAnswers(attemptId) {
  const answers = await prisma.answer.findMany({
    where: { attemptId },
    include: {
      question: {
        include: {
          options: true
        }
      }
    }
  });
  return answers;
}

// Example 7: Transaction example - Submit multiple answers
async function submitQuizAnswers(attemptId, answers) {
  const result = await prisma.$transaction(async (tx) => {
    // Create all answers
    const createdAnswers = await Promise.all(
      answers.map(answer => 
        tx.answer.create({
          data: {
            attemptId,
            questionId: answer.questionId,
            selectedOptionIds: answer.selectedOptionIds,
            isCorrect: answer.isCorrect,
            pointsEarned: answer.pointsEarned
          }
        })
      )
    );

    // Calculate total score
    const totalScore = createdAnswers.reduce((sum, ans) => sum + ans.pointsEarned, 0);

    // Update attempt
    const updatedAttempt = await tx.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score: totalScore,
        status: 'completed',
        endTime: new Date()
      }
    });

    return { answers: createdAnswers, attempt: updatedAttempt };
  });

  return result;
}

module.exports = {
  getAllQuizzes,
  getQuizWithQuestions,
  createQuizAttempt,
  updateAttemptScore,
  createAnswer,
  getAttemptAnswers,
  submitQuizAnswers
};

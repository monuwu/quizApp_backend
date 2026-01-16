const { pool } = require('../../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Answer Service - Business logic for answer submission and evaluation
 */
class AnswerService {

  async submitAnswer(attemptId, questionId, selectedOptionIds) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Verify attempt exists and is active
      const [attempts] = await connection.execute(
        'SELECT quiz_id, status, expiration_time FROM quiz_attempts WHERE id = $1',
        [attemptId]
      );

      if (attempts.length === 0) {
        throw new AppError('Quiz attempt not found', 404);
      }

      const attempt = attempts[0];

      // Check if attempt is still in progress
      if (attempt.status !== 'in_progress') {
        throw new AppError(`Cannot submit answer. Attempt is ${attempt.status}`, 403);
      }

      // Check if attempt has expired
      const now = new Date();
      if (now > new Date(attempt.expiration_time)) {
        // Auto-expire the attempt
        await connection.execute(
          'UPDATE quiz_attempts SET status = $1, end_time = $2 WHERE id = $3',
          ['expired', now, attemptId]
        );
        throw new AppError('Quiz attempt has expired', 403);
      }

      // Verify question belongs to the quiz
      const [questions] = await connection.execute(
        'SELECT id, question_type, points FROM questions WHERE id = $1 AND quiz_id = $2',
        [questionId, attempt.quiz_id]
      );

      if (questions.length === 0) {
        throw new AppError('Question not found in this quiz', 404);
      }

      const question = questions[0];

      // Validate selected options exist and belong to this question
      if (!Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
        throw new AppError('At least one option must be selected', 400);
      }

      const placeholders = selectedOptionIds.map((_, i) => `$${i + 1}`).join(',');
      const [options] = await connection.execute(
        `SELECT id, is_correct FROM options WHERE id IN (${placeholders}) AND question_id = $${selectedOptionIds.length + 1}`,
        [...selectedOptionIds, questionId]
      );

      if (options.length !== selectedOptionIds.length) {
        throw new AppError('Invalid option selection', 400);
      }

      // Fetch valid option IDs for the question
      const validOptions = await connection.execute(
        'SELECT id FROM options WHERE question_id = $1',
        [questionId]
      );
      const validOptionIds = validOptions.map(opt => opt.id);

      // Debug logging for troubleshooting
      console.log('Selected option IDs:', selectedOptionIds);
      console.log('Valid option IDs for question:', validOptionIds);

      // Validate selection
      const isSingle = question.question_type === 'single';
      if (isSingle) {
        if (
          !Array.isArray(selectedOptionIds) ||
          selectedOptionIds.length !== 1 ||
          !validOptionIds.includes(selectedOptionIds[0])
        ) {
          throw new AppError(
            `Invalid option selection: ${JSON.stringify(selectedOptionIds)}. Valid options: ${JSON.stringify(validOptionIds)}`,
            400
          );
        }
      } else {
        // Multiple choice: all selected must be valid
        if (
          !Array.isArray(selectedOptionIds) ||
          selectedOptionIds.length === 0 ||
          !selectedOptionIds.every(id => validOptionIds.includes(id))
        ) {
          throw new AppError(
            `Invalid option selection: ${JSON.stringify(selectedOptionIds)}. Valid options: ${JSON.stringify(validOptionIds)}`,
            400
          );
        }
      }

      // Get all correct options for this question
      const [correctOptions] = await connection.execute(
        'SELECT id FROM options WHERE question_id = $1 AND is_correct = true',
        [questionId]
      );

      const correctOptionIds = correctOptions.map(opt => opt.id).sort();
      const selectedSorted = [...selectedOptionIds].sort();

      // Check if answer is correct
      const isCorrect = JSON.stringify(correctOptionIds) === JSON.stringify(selectedSorted);
      const pointsEarned = isCorrect ? question.points : 0;

      // Check if answer already exists (update scenario)
      const [existingAnswers] = await connection.execute(
        'SELECT id FROM answers WHERE attempt_id = $1 AND question_id = $2',
        [attemptId, questionId]
      );

      if (existingAnswers.length > 0) {
        // Update existing answer
        await connection.execute(
          `UPDATE answers 
          SET selected_option_ids = $1, is_correct = $2, points_earned = $3, answered_at = $4
          WHERE id = $5`,
          [JSON.stringify(selectedOptionIds), isCorrect, pointsEarned, now, existingAnswers[0].id]
        );
      } else {
        // Insert new answer
        await connection.execute(
          `INSERT INTO answers 
          (attempt_id, question_id, selected_option_ids, is_correct, points_earned, answered_at)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [attemptId, questionId, JSON.stringify(selectedOptionIds), isCorrect, pointsEarned, now]
        );
      }

      await connection.commit();

      return {
        questionId,
        isCorrect,
        pointsEarned,
        maxPoints: question.points
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Submit multiple answers at once
   */
  async submitMultipleAnswers(attemptId, answers) {
    const results = [];
    
    for (const answer of answers) {
      const result = await this.submitAnswer(
        attemptId,
        answer.questionId,
        answer.selectedOptionIds
      );
      results.push(result);
    }

    return results;
  }

  /**
   * Get all answers for an attempt
   */
  async getAttemptAnswers(attemptId) {
    const [answers] = await pool.execute(
      `SELECT 
        a.id,
        a.question_id,
        a.selected_option_ids,
        a.is_correct,
        a.points_earned,
        a.answered_at,
        q.question_text,
        q.points as max_points
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE a.attempt_id = $1
      ORDER BY q.order_number`,
      [attemptId]
    );

    // Parse JSON fields
    answers.forEach(answer => {
      answer.selected_option_ids = JSON.parse(answer.selected_option_ids);
    });

    return answers;
  }

  /**
   * Get answer statistics for an attempt
   */
  async getAnswerStatistics(attemptId) {
    const [stats] = await pool.execute(
      `SELECT 
        COUNT(*) as total_answered,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as incorrect_answers,
        SUM(points_earned) as total_points_earned
      FROM answers
      WHERE attempt_id = $1`,
      [attemptId]
    );

    // Get total questions in the quiz
    const [attemptInfo] = await pool.execute(
      `SELECT qa.quiz_id 
      FROM quiz_attempts qa
      WHERE qa.id = $1`,
      [attemptId]
    );

    if (attemptInfo.length > 0) {
      const [questionCount] = await pool.execute(
        'SELECT COUNT(*) as total_questions FROM questions WHERE quiz_id = $1',
        [attemptInfo[0].quiz_id]
      );
      
      stats[0].total_questions = questionCount[0].total_questions;
      stats[0].unanswered = questionCount[0].total_questions - (stats[0].total_answered || 0);
    }

    return stats[0];
  }
}

module.exports = new AnswerService();

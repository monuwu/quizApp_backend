const { pool } = require('../../config/database');
const { AppError } = require('../middleware/errorHandler');

/**
 * Quiz Service - Business logic for quiz operations
 */
class QuizService {
  /**
   * Get all quizzes by level
   */
  async getQuizzesByLevel(level) {
    const validLevels = ['beginner', 'intermediate', 'advanced'];
    
    let query = 'SELECT id, title, description, level, duration_minutes, passing_score, created_at FROM quizzes WHERE is_active = true';
    let params = [];

    if (level) {
      if (!validLevels.includes(level)) {
        throw new AppError('Invalid level. Must be: beginner, intermediate, or advanced', 400);
      }
      // Fixed for PostgreSQL
      query += ' AND level = $1'; 
      params.push(level);
    }

    query += ' ORDER BY created_at DESC';

    const [quizzes] = await pool.execute(query, params);
    return quizzes;
  }

  /**
   * Get quiz by ID with questions and options (without correct answers)
   */
  async getQuizDetails(quizId) {
    const [quizzes] = await pool.execute(
      'SELECT id, title, description, level, duration_minutes, passing_score FROM quizzes WHERE id = $1 AND is_active = true',
      [quizId]
    );

    if (!quizzes || quizzes.length === 0) {
      throw new AppError('Quiz not found', 404);
    }

    const quiz = quizzes[0];

    // Get questions - Fixed for PostgreSQL
    const [questions] = await pool.execute(
      'SELECT id, question_text, question_type, points, order_number FROM questions WHERE quiz_id = $1 ORDER BY order_number',
      [quizId]
    );

    // Get options - Fixed for PostgreSQL
    for (let question of questions) {
      const [options] = await pool.execute(
        'SELECT id, option_text, order_number FROM options WHERE question_id = $1 ORDER BY order_number',
        [question.id]
      );
      question.options = options;
    }

    quiz.questions = questions;
    return quiz;
  }

  /**
   * Get quiz with correct answers (for internal evaluation)
   */
  async getQuizWithAnswers(quizId) {
    // Fixed placeholder to $1
    const [quizzes] = await pool.execute(
      'SELECT id, title, duration_minutes FROM quizzes WHERE id = $1',
      [quizId]
    );

    if (quizzes.length === 0) {
      throw new AppError('Quiz not found', 404);
    }

    const quiz = quizzes[0];

    // Get questions - Fixed placeholder to $1
    const [questions] = await pool.execute(
      'SELECT id, question_text, question_type, points FROM questions WHERE quiz_id = $1',
      [quizId]
    );

    for (let question of questions) {
      // Fixed placeholder to $1
      const [options] = await pool.execute(
        'SELECT id, option_text, is_correct FROM options WHERE question_id = $1',
        [question.id]
      );
      question.options = options;
      question.correctOptionIds = options
        .filter(opt => opt.is_correct)
        .map(opt => opt.id);
    }

    quiz.questions = questions;
    return quiz;
  }

  /**
   * Calculate total points for a quiz
   */
  async calculateTotalPoints(quizId) {
    // Fixed placeholder to $1
    const [result] = await pool.execute(
      'SELECT SUM(points) as total_points FROM questions WHERE quiz_id = $1',
      [quizId]
    );
    
    // In Postgres, SUM might return a string or number depending on driver config
    return result[0]?.total_points ? parseFloat(result[0].total_points) : 0;
  }
}

module.exports = new QuizService();
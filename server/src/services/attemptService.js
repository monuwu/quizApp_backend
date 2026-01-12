const { pool } = require('../../../app/config/database');
const { AppError } = require('../../../app/middleware/errorHandler');
const quizService = require('./quizService');

/**
 * Attempt Service - Business logic for quiz attempts
 */
class AttemptService {
  /**
   * Start a new quiz attempt
   */
  async startAttempt(quizId, userId = null) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get quiz details - Fixed placeholder to $1
      const [quizzes] = await connection.execute(
        'SELECT id, duration_minutes, is_active FROM quizzes WHERE id = $1',
        [quizId]
      );

      if (quizzes.length === 0) {
        throw new AppError('Quiz not found', 404);
      }

      const quiz = quizzes[0];

      if (!quiz.is_active) {
        throw new AppError('Quiz is not active', 400);
      }

      // Check for existing active attempts - Fixed placeholders $1, $2, $3
      if (userId) {
        const [existingAttempts] = await connection.execute(
          'SELECT id FROM quiz_attempts WHERE quiz_id = $1 AND user_id = $2 AND status = $3',
          [quizId, userId, 'in_progress']
        );

        if (existingAttempts.length > 0) {
          throw new AppError('You already have an active attempt for this quiz', 409);
        }
      }

      const startTime = new Date();
      const expirationTime = new Date(startTime.getTime() + quiz.duration_minutes * 60000);
      const totalPoints = await quizService.calculateTotalPoints(quizId);

      // Create attempt record 
      // NOTE: Added RETURNING id because Postgres doesn't use .insertId
      const [result] = await connection.execute(
        `INSERT INTO quiz_attempts 
        (quiz_id, user_id, start_time, expiration_time, status, total_points) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [quizId, userId, startTime, expirationTime, 'in_progress', totalPoints]
      );

      const attemptId = result[0].id; // Postgres returns the row with the new ID

      await connection.commit();

      return {
        attemptId,
        quizId,
        startTime,
        expirationTime,
        durationMinutes: quiz.duration_minutes,
        status: 'in_progress'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get attempt details
   */
  async getAttemptById(attemptId) {
    const [attempts] = await pool.execute(
      `SELECT 
        qa.id,
        qa.quiz_id,
        qa.user_id,
        qa.start_time,
        qa.end_time,
        qa.expiration_time,
        qa.status,
        qa.score,
        qa.total_points,
        qa.percentage,
        q.title as quiz_title,
        q.duration_minutes
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = $1`,
      [attemptId]
    );

    if (attempts.length === 0) {
      throw new AppError('Attempt not found', 404);
    }

    const attempt = attempts[0];

    const now = new Date();
    if (now > new Date(attempt.expiration_time) && attempt.status === 'in_progress') {
      await this.expireAttempt(attemptId);
      attempt.status = 'expired';
    }

    return attempt;
  }

  /**
   * Get user's attempt history
   */
  async getUserAttempts(userId, quizId = null) {
    let query = `
      SELECT 
        qa.id,
        qa.quiz_id,
        qa.start_time,
        qa.end_time,
        qa.status,
        qa.score,
        qa.total_points,
        qa.percentage,
        q.title as quiz_title,
        q.level
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.user_id = $1
    `;
    
    const params = [userId];

    if (quizId) {
      query += ' AND qa.quiz_id = $2'; // Incremented to $2
      params.push(quizId);
    }

    query += ' ORDER BY qa.start_time DESC'; // Changed to start_time as created_at might not exist

    const [attempts] = await pool.execute(query, params);
    return attempts;
  }

  /**
   * Finalize quiz attempt and calculate score
   */
  async finalizeAttempt(attemptId) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const [attempts] = await connection.execute(
        'SELECT quiz_id, status, total_points, expiration_time FROM quiz_attempts WHERE id = $1',
        [attemptId]
      );

      if (attempts.length === 0) {
        throw new AppError('Attempt not found', 404);
      }

      const attempt = attempts[0];

      if (attempt.status !== 'in_progress') {
        throw new AppError(`Attempt is already ${attempt.status}`, 400);
      }

      const now = new Date();
      const isExpired = now > new Date(attempt.expiration_time);

      const [answers] = await connection.execute(
        'SELECT SUM(points_earned) as earned_points FROM answers WHERE attempt_id = $1',
        [attemptId]
      );

      const earnedPoints = parseFloat(answers[0]?.earned_points || 0);
      const percentage = attempt.total_points > 0 
        ? (earnedPoints / attempt.total_points) * 100 
        : 0;

      const status = isExpired ? 'expired' : 'completed';

      await connection.execute(
        `UPDATE quiz_attempts 
        SET status = $1, end_time = $2, score = $3, percentage = $4
        WHERE id = $5`,
        [status, now, earnedPoints, percentage.toFixed(2), attemptId]
      );

      await connection.commit();

      return {
        attemptId,
        status,
        score: earnedPoints,
        totalPoints: attempt.total_points,
        percentage: parseFloat(percentage.toFixed(2))
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Auto-expire an attempt
   */
  async expireAttempt(attemptId) {
    await pool.execute(
      'UPDATE quiz_attempts SET status = $1, end_time = $2 WHERE id = $3 AND status = $4',
      ['expired', new Date(), attemptId, 'in_progress']
    );
  }

  /**
   * Get attempt results with detailed breakdown
   */
  async getAttemptResults(attemptId) {
    const attempt = await this.getAttemptById(attemptId);

    const [answers] = await pool.execute(
      `SELECT a.*, q.question_text, q.points as max_points
      FROM answers a 
      JOIN questions q ON a.question_id = q.id 
      WHERE a.attempt_id = $1`,
      [attemptId]
    );

    for (let answer of answers) {
      const [options] = await pool.execute(
        'SELECT id, option_text, is_correct FROM options WHERE question_id = $1',
        [answer.question_id]
      );
      answer.options = options;
      // Note: No JSON.parse needed for PostgreSQL JSONB columns
    }

    return { attempt, answers };
  }
}

module.exports = new AttemptService();
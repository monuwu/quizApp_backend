const { AppError } = require('./errorHandler');

/**
 * Middleware to validate if quiz attempt has expired
 */
const validateAttemptNotExpired = async (req, res, next) => {
  try {
    const { attemptId } = req.params;
    
    if (!attemptId) {
      return next();
    }

    const { pool } = require('../../config/database');
    const [attempts] = await pool.execute(
      'SELECT expiration_time, status FROM quiz_attempts WHERE id = ?',
      [attemptId]
    );

    if (attempts.length === 0) {
      throw new AppError('Quiz attempt not found', 404);
    }

    const attempt = attempts[0];
    const now = new Date();
    const expirationTime = new Date(attempt.expiration_time);

    if (now > expirationTime && attempt.status === 'in_progress') {
      // Auto-expire the attempt
      await pool.execute(
        'UPDATE quiz_attempts SET status = ?, end_time = ? WHERE id = ?',
        ['expired', now, attemptId]
      );
      throw new AppError('Quiz attempt has expired', 403);
    }

    if (attempt.status !== 'in_progress') {
      throw new AppError(`Quiz attempt is already ${attempt.status}`, 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validateAttemptNotExpired };

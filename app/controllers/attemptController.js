const attemptService = require('../services/attemptService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   POST /api/attempts/start
 * @desc    Start a new quiz attempt
 * @access  Public (will be protected with auth later)
 */
const startQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId, userId } = req.body;

  if (!quizId) {
    return res.status(400).json({
      success: false,
      message: 'Quiz ID is required'
    });
  }

  const attempt = await attemptService.startAttempt(quizId, userId);

  res.status(201).json({
    success: true,
    message: 'Quiz attempt started successfully',
    data: attempt
  });
});

/**
 * @route   GET /api/attempts/:id
 * @desc    Get attempt details
 * @access  Public
 */
const getAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const attempt = await attemptService.getAttemptById(id);

  res.status(200).json({
    success: true,
    data: attempt
  });
});

/**
 * @route   POST /api/attempts/:id/finalize
 * @desc    Finalize quiz attempt and calculate final score
 * @access  Public
 */
const finalizeAttempt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await attemptService.finalizeAttempt(id);

  res.status(200).json({
    success: true,
    message: 'Quiz attempt finalized successfully',
    data: result
  });
});

/**
 * @route   GET /api/attempts/:id/results
 * @desc    Get detailed results of a completed attempt
 * @access  Public
 */
const getAttemptResults = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const results = await attemptService.getAttemptResults(id);

  res.status(200).json({
    success: true,
    data: results
  });
});

/**
 * @route   GET /api/attempts/user/:userId
 * @desc    Get all attempts for a user
 * @access  Public
 */
const getUserAttempts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { quizId } = req.query;

  const attempts = await attemptService.getUserAttempts(userId, quizId);

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts
  });
});

module.exports = {
  startQuizAttempt,
  getAttempt,
  finalizeAttempt,
  getAttemptResults,
  getUserAttempts
};

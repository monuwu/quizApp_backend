const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');
const { validateAttemptNotExpired } = require('../middleware/validation');
const attemptController = require('../controllers/attemptController');
const answerController = require('../controllers/answerController');

/**
 * @route   POST /api/attempts/start
 * @desc    Start a new quiz attempt
 */
router.post(
  '/start',
  [
    body('quizId')
      .notEmpty()
      .withMessage('Quiz ID is required')
      .isInt()
      .withMessage('Quiz ID must be a valid integer'),
    body('userId')
      .optional()
      .isInt()
      .withMessage('User ID must be a valid integer'),
    validate
  ],
  attemptController.startQuizAttempt
);

/**
 * @route   GET /api/attempts/:id
 * @desc    Get attempt details
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Attempt ID must be a valid integer'),
    validate
  ],
  attemptController.getAttempt
);

/**
 * @route   POST /api/attempts/:id/finalize
 * @desc    Finalize quiz attempt
 */
router.post(
  '/:id/finalize',
  [
    param('id').isInt().withMessage('Attempt ID must be a valid integer'),
    validate
  ],
  attemptController.finalizeAttempt
);

/**
 * @route   GET /api/attempts/:id/results
 * @desc    Get detailed results
 */
router.get(
  '/:id/results',
  [
    param('id').isInt().withMessage('Attempt ID must be a valid integer'),
    validate
  ],
  attemptController.getAttemptResults
);

/**
 * @route   GET /api/attempts/user/:userId
 * @desc    Get user's attempt history
 */
router.get(
  '/user/:userId',
  [
    param('userId').isInt().withMessage('User ID must be a valid integer'),
    validate
  ],
  attemptController.getUserAttempts
);

/**
 * @route   POST /api/attempts/:attemptId/answers
 * @desc    Submit answer for a question
 */
router.post(
  '/:attemptId/answers',
  [
    param('attemptId').isInt().withMessage('Attempt ID must be a valid integer'),
    body('questionId')
      .notEmpty()
      .withMessage('Question ID is required')
      .isInt()
      .withMessage('Question ID must be a valid integer'),
    body('selectedOptionIds')
      .notEmpty()
      .withMessage('Selected options are required')
      .isArray({ min: 1 })
      .withMessage('At least one option must be selected'),
    body('selectedOptionIds.*')
      .isInt()
      .withMessage('Each option ID must be a valid integer'),
    validate
  ],
  validateAttemptNotExpired,
  answerController.submitAnswer
);

/**
 * @route   POST /api/attempts/:attemptId/answers/bulk
 * @desc    Submit multiple answers at once
 */
router.post(
  '/:attemptId/answers/bulk',
  [
    param('attemptId').isInt().withMessage('Attempt ID must be a valid integer'),
    body('answers')
      .notEmpty()
      .withMessage('Answers array is required')
      .isArray({ min: 1 })
      .withMessage('Answers must be a non-empty array'),
    validate
  ],
  validateAttemptNotExpired,
  answerController.submitMultipleAnswers
);

/**
 * @route   GET /api/attempts/:attemptId/answers
 * @desc    Get all answers for an attempt
 */
router.get(
  '/:attemptId/answers',
  [
    param('attemptId').isInt().withMessage('Attempt ID must be a valid integer'),
    validate
  ],
  answerController.getAttemptAnswers
);

/**
 * @route   GET /api/attempts/:attemptId/statistics
 * @desc    Get answer statistics
 */
router.get(
  '/:attemptId/statistics',
  [
    param('attemptId').isInt().withMessage('Attempt ID must be a valid integer'),
    validate
  ],
  answerController.getAnswerStatistics
);

module.exports = router;

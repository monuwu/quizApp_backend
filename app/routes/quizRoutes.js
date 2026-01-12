const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { validate } = require('../middleware/validator');
const quizController = require('../controllers/quizController');

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes, optionally filtered by level
 */
router.get(
  '/',
  [
    query('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be: beginner, intermediate, or advanced'),
    validate
  ],
  quizController.getQuizzes
);

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz details with questions and options
 */
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('Quiz ID must be a valid integer'),
    validate
  ],
  quizController.getQuizById
);

module.exports = router;

const quizService = require('../services/quizService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   GET /api/quizzes
 * @desc    Get all quizzes, optionally filtered by level
 * @access  Public
 */
const getQuizzes = asyncHandler(async (req, res) => {
  const { level } = req.query;
  
  const quizzes = await quizService.getQuizzesByLevel(level);
  
  res.status(200).json({
    success: true,
    count: quizzes.length,
    data: quizzes
  });
});

/**
 * @route   GET /api/quizzes/:id
 * @desc    Get quiz details with questions and options (no correct answers)
 * @access  Public
 */
const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const quiz = await quizService.getQuizDetails(id);
  
  res.status(200).json({
    success: true,
    data: quiz
  });
});

module.exports = {
  getQuizzes,
  getQuizById
};

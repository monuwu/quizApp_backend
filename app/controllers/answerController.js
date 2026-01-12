const answerService = require('../services/answerService');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * @route   POST /api/attempts/:attemptId/answers
 * @desc    Submit answer for a question
 * @access  Public
 */
const submitAnswer = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { questionId, selectedOptionIds } = req.body;

  if (!questionId) {
    return res.status(400).json({
      success: false,
      message: 'Question ID is required'
    });
  }

  if (!selectedOptionIds || !Array.isArray(selectedOptionIds) || selectedOptionIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one option must be selected'
    });
  }

  const result = await answerService.submitAnswer(attemptId, questionId, selectedOptionIds);

  res.status(200).json({
    success: true,
    message: 'Answer submitted successfully',
    data: result
  });
});

/**
 * @route   POST /api/attempts/:attemptId/answers/bulk
 * @desc    Submit multiple answers at once
 * @access  Public
 */
const submitMultipleAnswers = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Answers array is required'
    });
  }

  // Validate answer format
  for (const answer of answers) {
    if (!answer.questionId || !answer.selectedOptionIds) {
      return res.status(400).json({
        success: false,
        message: 'Each answer must have questionId and selectedOptionIds'
      });
    }
  }

  const results = await answerService.submitMultipleAnswers(attemptId, answers);

  res.status(200).json({
    success: true,
    message: 'Answers submitted successfully',
    data: results
  });
});

/**
 * @route   GET /api/attempts/:attemptId/answers
 * @desc    Get all answers for an attempt
 * @access  Public
 */
const getAttemptAnswers = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;

  const answers = await answerService.getAttemptAnswers(attemptId);

  res.status(200).json({
    success: true,
    count: answers.length,
    data: answers
  });
});

/**
 * @route   GET /api/attempts/:attemptId/statistics
 * @desc    Get answer statistics for an attempt
 * @access  Public
 */
const getAnswerStatistics = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;

  const statistics = await answerService.getAnswerStatistics(attemptId);

  res.status(200).json({
    success: true,
    data: statistics
  });
});

module.exports = {
  submitAnswer,
  submitMultipleAnswers,
  getAttemptAnswers,
  getAnswerStatistics
};

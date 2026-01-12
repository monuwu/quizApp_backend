const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validator');
const authController = require('../controllers/authController');

// Request OTP
router.post(
  '/request-otp',
  [body('phone').notEmpty().withMessage('Phone is required'), validate],
  authController.requestOtp
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    validate
  ],
  authController.verifyOtp
);

module.exports = router;

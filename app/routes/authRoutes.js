const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

// Request OTP
router.post(
  '/request-otp',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    validate
  ],
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

// Signup
router.post(
  '/signup',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('country_code').notEmpty().withMessage('Country code is required'),
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('confirm_password')
      .notEmpty()
      .withMessage('Confirm password is required'),
    validate
  ],
  authController.signup
);

// Login
router.post(
  '/login',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

// Forgot Password (request reset OTP)
router.post(
  '/forgot-password',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    validate
  ],
  authController.forgotPassword
);

// Reset Password (with OTP verification)
router.post(
  '/reset-password',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body('otp').notEmpty().withMessage('OTP is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validate
  ],
  authController.resetPassword
);

// Set Password (after OTP verification)
router.post(
  '/set-password',
  [
    body('phone').notEmpty().withMessage('Phone is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validate
  ],
  authController.setPassword
);

// Get Profile (protected)
router.get('/profile', authenticate, authController.getProfile);

// Update Profile (protected)
router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Invalid email format'),
    validate
  ],
  authController.updateProfile
);

module.exports = router;

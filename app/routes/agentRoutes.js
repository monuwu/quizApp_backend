const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { validate } = require('../middleware/validator');
const agentController = require('../controllers/agentController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected: Fetch agent profile
router.get('/:id/profile', authMiddleware, [param('id').isInt().withMessage('Agent ID must be integer'), validate], agentController.getAgentProfile);

// Protected: Fetch agent stats
router.get('/:id/stats', authMiddleware, [param('id').isInt().withMessage('Agent ID must be integer'), validate], agentController.getAgentStats);

// Protected: Update last activity
router.post('/:id/activity', authMiddleware, [param('id').isInt().withMessage('Agent ID must be integer'), validate], agentController.updateLastActivity);

module.exports = router;

const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const { validate } = require('../middleware/validator');
const levelController = require('../controllers/levelController');
const authMiddleware = require('../middleware/authMiddleware');

// Public: Get all levels
router.get('/', levelController.getLevels);

// Protected: Get agent's current level
router.get('/agent/:id', authMiddleware, [param('id').isInt().withMessage('Agent ID must be integer'), validate], levelController.getAgentLevel);

// Protected: Update agent's level
router.post('/agent/:id/update', authMiddleware, [param('id').isInt().withMessage('Agent ID must be integer'), validate], levelController.updateAgentLevel);

module.exports = router;

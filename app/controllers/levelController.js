const { LevelService } = require('../services/identityService');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/levels - fetch all levels
const getLevels = asyncHandler(async (req, res) => {
  const levels = await LevelService.getAll();
  res.json({ success: true, data: levels });
});

// GET /api/agents/:id/level - fetch agent's current level
const getAgentLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const level = await LevelService.getAgentLevel(Number(id));
  res.json({ success: true, data: level });
});

// POST /api/agents/:id/level/update - update agent's level if requirements met
const updateAgentLevel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const level = await LevelService.updateAgentLevel(Number(id));
  res.json({ success: true, data: level });
});

module.exports = { getLevels, getAgentLevel, updateAgentLevel };

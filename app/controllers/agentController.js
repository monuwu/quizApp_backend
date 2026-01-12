const { SalesAgentService, LevelService } = require('../services/identityService');
const prisma = require('../../lib/prisma');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/agents/:id/profile - fetch agent profile
const getAgentProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await SalesAgentService.findByPhone(id) || await prisma.salesAgent.findUnique({ where: { id: Number(id) } });
  if (!agent) return res.status(404).json({ success: false, message: 'Agent not found' });
  res.json({ success: true, data: agent });
});

// GET /api/agents/:id/stats - fetch agent stats
const getAgentStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Total points and quizzes taken
  const [pointsAgg, quizzesAgg] = await Promise.all([
    prisma.quizAttempt.aggregate({ _sum: { score: true }, where: { userId: Number(id) } }),
    prisma.quizAttempt.count({ where: { userId: Number(id) } })
  ]);
  res.json({
    success: true,
    data: {
      totalPoints: pointsAgg._sum.score || 0,
      quizzesTaken: quizzesAgg
    }
  });
});

// POST /api/agents/:id/activity - update last activity
const updateLastActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const agent = await prisma.salesAgent.update({
    where: { id: Number(id) },
    data: { updatedAt: new Date() }
  });
  res.json({ success: true, data: agent });
});

module.exports = { getAgentProfile, getAgentStats, updateLastActivity };

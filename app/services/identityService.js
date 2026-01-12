// Service for sales_agents, otp_verifications, levels (basic CRUD, OTP helpers)
const prisma = require('../../lib/prisma');

const SalesAgentService = {
  async findByPhone(phone) {
    return prisma.salesAgent.findUnique({ where: { phone } });
  },
  async createAgent({ name, phone, email, passwordHash }) {
    return prisma.salesAgent.create({ data: { name, phone, email, passwordHash } });
  }
};

const OtpVerificationService = {
  async create({ salesAgentId, otpCode, expiresAt }) {
    return prisma.otpVerification.create({ data: { salesAgentId, otpCode, expiresAt } });
  },
  async findValid({ salesAgentId, otpCode }) {
    return prisma.otpVerification.findFirst({
      where: {
        salesAgentId,
        otpCode,
        expiresAt: { gte: new Date() },
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    });
  },
  async markVerified(id) {
    return prisma.otpVerification.update({ where: { id }, data: { verified: true } });
  }
};

const LevelService = {
  async getAll() {
    return prisma.level.findMany();
  },
  async create({ name, description, minScore }) {
    return prisma.level.create({ data: { name, description, minScore } });
  },
  // Get agent's current level based on score
  async getAgentLevel(agentId) {
    // Assume agent has a 'score' field or calculate from attempts
    // For demo, fetch total score from quiz_attempts
    const result = await prisma.quizAttempt.aggregate({
      _sum: { score: true },
      where: { userId: agentId }
    });
    const totalScore = result._sum.score || 0;
    // Find highest level where minScore <= totalScore
    const levels = await prisma.level.findMany({ orderBy: { minScore: 'desc' } });
    return levels.find(l => totalScore >= l.minScore) || null;
  },
  // Update agent's level if requirements met (store in agent if needed)
  async updateAgentLevel(agentId) {
    const level = await this.getAgentLevel(agentId);
    if (!level) return null;
    // Optionally, update agent's record with level info (if field exists)
    // await prisma.salesAgent.update({ where: { id: agentId }, data: { levelId: level.id } });
    return level;
  }
};

module.exports = { SalesAgentService, OtpVerificationService, LevelService };
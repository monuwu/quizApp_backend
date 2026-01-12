const prisma = require('../../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new AppError('Phone is required', 400);

    let agent = await prisma.salesAgent.findUnique({ where: { phone } });
    if (!agent) {
      agent = await prisma.salesAgent.create({
        data: { name: 'Agent', phone, email: `${phone}@example.com`, passwordHash: '' }
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.otpVerification.create({
      data: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt
      }
    });

    // In production, send OTP via SMS. Here, return in response for demo.
    res.json({ success: true, message: 'OTP sent', otp });
  } catch (err) {
    next(err);
  }
};

// Verify OTP
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new AppError('Phone and OTP are required', 400);

    const agent = await prisma.salesAgent.findUnique({ where: { phone } });
    if (!agent) throw new AppError('Agent not found', 404);

    const record = await prisma.otpVerification.findFirst({
      where: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt: { gte: new Date() },
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!record) throw new AppError('Invalid or expired OTP', 400);

    await prisma.otpVerification.update({ where: { id: record.id }, data: { verified: true } });

    // Issue JWT (for demo, use agent id)
    const token = jwt.sign({ agentId: agent.id, phone: agent.phone }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
    res.json({ success: true, message: 'OTP verified', token });
  } catch (err) {
    next(err);
  }
};

module.exports = { requestOtp, verifyOtp };
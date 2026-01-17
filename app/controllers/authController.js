const prisma = require('../../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Generate a 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate JWT token
function generateToken(agent) {
  return jwt.sign(
    { agentId: agent.id, phone: agent.phone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Hash password
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

// Compare password
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ============== Request OTP ==============
const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    if (!phone) throw new AppError('Phone is required', 400);

    // Check if agent exists
    let agent = await prisma.SalesAgent.findUnique({ where: { phone } });

    // If agent doesn't exist, we'll create them during signup
    // For now, create a temporary entry for OTP purposes
    if (!agent) {
      agent = await prisma.SalesAgent.create({
        data: {
          name: 'Pending',
          phone,
          email: `${phone.replace(/[^0-9]/g, '')}@pending.com`,
          passwordHash: ''
        }
      });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.OtpVerification.create({
      data: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt
      }
    });

    // In production, send OTP via SMS service (Twilio, etc.)
    // For demo/development, return OTP in response
    console.log(`OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - only for demo
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    next(err);
  }
};

// ============== Verify OTP ==============
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new AppError('Phone and OTP are required', 400);

    const agent = await prisma.SalesAgent.findUnique({ where: { phone } });
    if (!agent) throw new AppError('User not found', 404);

    const record = await prisma.OtpVerification.findFirst({
      where: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt: { gte: new Date() },
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) throw new AppError('Invalid or expired OTP', 400);

    // Mark OTP as verified
    await prisma.OtpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    });

    // Generate token
    const token = generateToken(agent);

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        token,
        user: {
          id: agent.id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============== Signup ==============
const signup = async (req, res, next) => {
  try {
    const { name, country_code, phone_number, password, confirm_password } = req.body;

    // Validate required fields
    if (!name || !country_code || !phone_number || !password || !confirm_password) {
      throw new AppError('All fields are required: name, country_code, phone_number, password, confirm_password', 400);
    }

    // Validate password match
    if (password !== confirm_password) {
      throw new AppError('Passwords do not match', 400);
    }

    // Validate password length
    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Combine country code and phone number
    const fullPhone = `${country_code}${phone_number}`;

    // Check if user already exists with a password set
    let agent = await prisma.SalesAgent.findUnique({ where: { phone: fullPhone } });

    if (agent && agent.passwordHash) {
      throw new AppError('User already exists. Please login.', 400);
    }

    const passwordHash = await hashPassword(password);
    const userEmail = `${phone_number.replace(/[^0-9]/g, '')}@user.com`;

    if (agent) {
      // Update existing pending agent
      agent = await prisma.SalesAgent.update({
        where: { id: agent.id },
        data: {
          name,
          passwordHash,
          email: userEmail
        }
      });
    } else {
      // Create new agent
      agent = await prisma.SalesAgent.create({
        data: {
          name,
          phone: fullPhone,
          email: userEmail,
          passwordHash
        }
      });
    }

    const token = generateToken(agent);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: {
          id: agent.id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============== Login ==============
const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new AppError('Phone and password are required', 400);
    }

    const agent = await prisma.SalesAgent.findUnique({ where: { phone } });

    if (!agent) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!agent.passwordHash) {
      throw new AppError('Please complete registration first', 401);
    }

    const isValid = await comparePassword(password, agent.passwordHash);

    if (!isValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!agent.isActive) {
      throw new AppError('Account is deactivated. Please contact support.', 401);
    }

    const token = generateToken(agent);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: agent.id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============== Forgot Password (Request Reset) ==============
const forgotPassword = async (req, res, next) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }

    const agent = await prisma.SalesAgent.findUnique({ where: { phone } });

    if (!agent) {
      throw new AppError('No account found with this phone number', 404);
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.OtpVerification.create({
      data: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt
      }
    });

    // In production, send OTP via SMS
    console.log(`Password reset OTP for ${phone}: ${otp}`);

    res.json({
      success: true,
      message: 'Password reset OTP sent',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    next(err);
  }
};

// ============== Reset Password ==============
const resetPassword = async (req, res, next) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      throw new AppError('Phone, OTP, and new password are required', 400);
    }

    if (newPassword.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const agent = await prisma.SalesAgent.findUnique({ where: { phone } });

    if (!agent) {
      throw new AppError('User not found', 404);
    }

    // Verify OTP
    const record = await prisma.OtpVerification.findFirst({
      where: {
        salesAgentId: agent.id,
        otpCode: otp,
        expiresAt: { gte: new Date() },
        verified: false
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!record) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Mark OTP as used
    await prisma.OtpVerification.update({
      where: { id: record.id },
      data: { verified: true }
    });

    // Update password
    const passwordHash = await hashPassword(newPassword);
    await prisma.SalesAgent.update({
      where: { id: agent.id },
      data: { passwordHash }
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    next(err);
  }
};

// ============== Set Password (After OTP Verification) ==============
const setPassword = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new AppError('Phone and password are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    const agent = await prisma.SalesAgent.findUnique({ where: { phone } });

    if (!agent) {
      throw new AppError('User not found', 404);
    }

    const passwordHash = await hashPassword(password);

    await prisma.SalesAgent.update({
      where: { id: agent.id },
      data: { passwordHash }
    });

    const token = generateToken(agent);

    res.json({
      success: true,
      message: 'Password set successfully',
      data: {
        token,
        user: {
          id: agent.id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// ============== Get Profile ==============
const getProfile = async (req, res, next) => {
  try {
    const agentId = req.user?.agentId;

    if (!agentId) {
      throw new AppError('Unauthorized', 401);
    }

    const agent = await prisma.SalesAgent.findUnique({
      where: { id: agentId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!agent) {
      throw new AppError('User not found', 404);
    }

    res.json({
      success: true,
      data: { user: agent }
    });
  } catch (err) {
    next(err);
  }
};

// ============== Update Profile ==============
const updateProfile = async (req, res, next) => {
  try {
    const agentId = req.user?.agentId;
    const { name, email } = req.body;

    if (!agentId) {
      throw new AppError('Unauthorized', 401);
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const agent = await prisma.SalesAgent.update({
      where: { id: agentId },
      data: updateData,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: agent }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  signup,
  login,
  forgotPassword,
  resetPassword,
  setPassword,
  getProfile,
  updateProfile
};

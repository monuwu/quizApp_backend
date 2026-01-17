const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Auth middleware to validate JWT and extract user context
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { 
      agentId: decoded.agentId, 
      phone: decoded.phone 
    };
    // Also set req.agent for backwards compatibility
    req.agent = req.user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Export both for flexibility
module.exports = { authenticate };
module.exports.default = authenticate;

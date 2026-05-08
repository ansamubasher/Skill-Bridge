const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token is required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication failed', error: error.message });
  }
};

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    const hasRole = req.user.role.some(r => allowedRoles.includes(r));
    if (!hasRole) return res.status(403).json({ success: false, message: 'Permission denied' });
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
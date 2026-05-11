const jwt = require('jsonwebtoken');

/**
 * Combined Auth Middleware
 * Supports both named export (authenticateToken) and default export for flexibility.
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecret123');
    
    // Normalize user object so it works across all controllers
    // Controllers use .id, ._id, or .userId
    const userId = decoded.id || decoded.userId || decoded._id;
    
    req.user = {
      ...decoded,
      id: userId,
      _id: userId,
      userId: userId
    };
    
    next();
  } catch (err) {
    console.error('JWT Verify Error:', err.message);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
  }
};

/**
 * Role-based authorization middleware
 */
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'Not authenticated' });
    
    // Handle both string and array roles
    const userRoles = Array.isArray(req.user.role) ? req.user.role : [req.user.role];
    const hasRole = userRoles.some(r => allowedRoles.includes(r));
    
    if (!hasRole) return res.status(403).json({ success: false, error: 'Permission denied' });
    next();
  };
};

// Export as both named and default
module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.authorizeRole = authorizeRole;

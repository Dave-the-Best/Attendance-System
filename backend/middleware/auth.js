const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const clean = token.startsWith('Bearer ') ? token.slice(7) : token;
    const decoded = jwt.verify(clean, process.env.JWT_SECRET);
    return await User.findById(decoded.id).select('-password');
  } catch {
    return null;
  }
};

const requireAuth = (user) => {
  if (!user) throw new Error('Not authenticated');
};

const requireAdmin = (user) => {
  requireAuth(user);
  if (user.role !== 'admin') throw new Error('Admin access required');
};

module.exports = { getUserFromToken, requireAuth, requireAdmin };

// middlewares/authMiddleware.js
// Simple placeholder auth middleware for local testing.
// It attaches a dummy user object to req so that controllers can read req.user.id.
// In a real app replace this with proper JWT / session verification.

const mongoose = require('mongoose');

module.exports = (req, res, next) => {
  // Use a fixed ObjectId for the client user (replace with a real user id if you have one)
  const dummyUserId = new mongoose.Types.ObjectId('60c72b2f9b1e8c001c8d4e01');
  req.user = { id: dummyUserId };
  next();
};

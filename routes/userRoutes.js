const express = require("express");

const {
  getProfile,
  getUserById,
  updateUserInfo,
  updatePassword,
} = require("../controllers/userController");

const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getProfile);
router.put("/info", authenticateToken, updateUserInfo);
router.put("/password", authenticateToken, updatePassword);

// Public route
router.get("/:id", getUserById);

module.exports = router;
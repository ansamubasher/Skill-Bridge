import express from "express";
import {
  getProfile,
  getUserById,
  updateUserInfo,
  updatePassword,
} from "../controllers/userController.js";
import { authenticateToken } from "../midllewares/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/profile", authenticateToken, getProfile); // GET /users/profile - Get authenticated user's account info
router.put("/info", authenticateToken, updateUserInfo); // PUT /users/info - Update name, department, academicYear
router.put("/password", authenticateToken, updatePassword); // PUT /users/password - Change password

// Public route
router.get("/:id", getUserById); // GET /users/:id - View public user info

export default router;

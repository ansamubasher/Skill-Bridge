import express from "express";
import { register, login, logout } from "../controllers/authController.js";
import { authenticateToken } from "../midllewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register); // POST /auth/register
router.post("/login", login); // POST /auth/login

// Protected routes
router.post("/logout", authenticateToken, logout); // POST /auth/logout

export default router;

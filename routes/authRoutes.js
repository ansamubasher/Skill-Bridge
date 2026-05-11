const express = require("express");

const { register, login, logout, forgotPassword, resetPassword } = require("../controllers/authController.js");
const { authenticateToken } = require("../middlewares/authMiddleware.js");

const router = express.Router();

console.log("about ti run route reg")
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.post("/logout", authenticateToken, logout); // POST /auth/logout

module.exports = router;
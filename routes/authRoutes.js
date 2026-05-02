const express = require("express");

const { register, login, logout } = require("../controllers/authController.js");
const { authenticateToken } = require("../midllewares/authMiddleware.js");

const router = express.Router();

console.log("about ti run route reg")
router.post("/register", register); // POST /auth/register 
router.post("/login", login);       // POST /auth/login

router.post("/logout", authenticateToken, logout); // POST /auth/logout

module.exports = router;
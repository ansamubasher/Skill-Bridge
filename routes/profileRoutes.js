
const express = require("express");
const { getMyProfile, getProfileById, updateProfile, addSkill,removeSkill,addPortfolioItem, removePortfolioItem } = require("../controllers/profileController.js");
const { authenticateToken } = require("../midllewares/authMiddleware.js");

const router = express.Router();

// Protected routes (require authentication)
router.get("/me", authenticateToken, getMyProfile); // GET /profiles/me - Get my profile
router.put("/", authenticateToken, updateProfile); // PUT /profiles - Update my profile
router.post("/skills", authenticateToken, addSkill); // POST /profiles/skills - Add skill
router.delete("/skills", authenticateToken, removeSkill); // DELETE /profiles/skills - Remove skill
router.post("/portfolio", authenticateToken, addPortfolioItem); // POST /profiles/portfolio - Add portfolio item
router.delete("/portfolio", authenticateToken, removePortfolioItem); // DELETE /profiles/portfolio - Remove portfolio item

// Public route
router.get("/:userId", getProfileById); // GET /profiles/:userId - View another user's profile

module.exports = router;
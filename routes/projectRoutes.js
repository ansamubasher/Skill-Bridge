const express = require("express");

const { authenticateToken } = require("../midllewares/authMiddleware.js");
const {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectBids,
  acceptProjectBid,
} = require("../controllers/projectController");


const router = express.Router();

// Apply authentication to all project routes
router.use(authenticateToken);

// Define routes
router.post("/", authenticateToken,createProject);
router.get("/my", authenticateToken, getMyProjects);
router.get("/:id",  authenticateToken, getProjectById);
router.put("/:id", authenticateToken, updateProject);
router.delete("/:id", authenticateToken, deleteProject);
router.patch("/:id/status",  authenticateToken, updateProjectStatus);
router.get("/:id/bids", authenticateToken,  getProjectBids);
router.patch("/:id/accept-bid", authenticateToken,  acceptProjectBid);

module.exports = router;
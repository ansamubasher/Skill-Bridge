import express from "express";
import {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectBids,
  acceptProjectBid,
} from "../controllers/projectController.js";
import { authenticateToken } from "../midllewares/authMiddleware.js";

const router = express.Router();

// Apply authentication to all project routes
router.use(authenticateToken);

// Define routes
router.post("/", createProject);
router.get("/my", getMyProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.patch("/:id/status", updateProjectStatus);
router.get("/:id/bids", getProjectBids);
router.patch("/:id/accept-bid", acceptProjectBid);

export default router;

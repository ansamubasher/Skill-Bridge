const express = require('express');
const { authenticateToken } = require('../middlewares/authMiddleware.js');
const {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectBids,
  placeBid,
  acceptProjectBid,
  getMyContracts,
  submitDelivery,
  getProjectDeliveries,
} = require('../controllers/projectController');

const router = express.Router();

// ── Deliveries ──────────────────────────────────────────────────────────────
router.post('/deliver', authenticateToken, submitDelivery);          // POST /projects/deliver
router.get('/:projectId/deliveries', authenticateToken, getProjectDeliveries); // GET /projects/:projectId/deliveries

// ── Contract ──────────────────────────────────────────────────────────────────
router.get('/contracts/mine', authenticateToken, getMyContracts);   // GET /projects/contracts/mine


// ── Freelancer browse ─────────────────────────────────────────────────────────
router.get('/', authenticateToken, getAllProjects);                  // GET /projects

// ── Client CRUD ───────────────────────────────────────────────────────────────
router.post('/', authenticateToken, createProject);                 // POST /projects
router.get('/my', authenticateToken, getMyProjects);                // GET /projects/my  ← MUST be before /:id

// ── Single project ────────────────────────────────────────────────────────────
router.get('/:id',             authenticateToken, getProjectById);
router.put('/:id',             authenticateToken, updateProject);
router.delete('/:id',          authenticateToken, deleteProject);
router.patch('/:id/status',    authenticateToken, updateProjectStatus);

// ── Bids ──────────────────────────────────────────────────────────────────────
router.get('/:id/bids',        authenticateToken, getProjectBids);  // GET  /projects/:id/bids
router.post('/:id/bids',       authenticateToken, placeBid);        // POST /projects/:id/bids
router.patch('/:id/accept-bid',authenticateToken, acceptProjectBid);// PATCH /projects/:id/accept-bid

module.exports = router;
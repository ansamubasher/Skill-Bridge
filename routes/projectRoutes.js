const express = require('express');
const multer = require('multer');
const path = require('path');
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

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ── Deliveries ──────────────────────────────────────────────────────────────
router.post('/deliver', authenticateToken, upload.array('files', 5), submitDelivery);          // POST /projects/deliver
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
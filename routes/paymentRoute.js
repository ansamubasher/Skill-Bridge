const express = require('express');
const router = express.Router();

// Controller functions
const {
  createPaymentRequest,
  confirmProjectReview,
  executePayout,
} = require('../controllers/paymentController');

// Simple auth middleware – you can replace with real auth later
const auth = require('../middlewares/authMiddleware');

// 1️⃣ Create a payment request when a client marks project completed
router.post('/:projectId/request', auth, createPaymentRequest);

// 2️⃣ Client reviews / approves the completed work
router.post('/:paymentId/review', auth, confirmProjectReview);

// 3️⃣ Trigger payout to freelancer (mock service)
router.post('/:paymentId/payout', auth, executePayout);

module.exports = router;
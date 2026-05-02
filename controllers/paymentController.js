// controllers/paymentController.js

const Payment = require('../models/Payment');
const mongoose = require('mongoose');

// ----- Mock payment service -----
const mockCharge = async (payment) => {
  console.log(`⚡️ Mock charging client ${payment.clientId} for $${payment.amount}`);
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { success: true, transactionId: `mock_${Date.now()}` };
};

/**
 * 1️⃣ Create a payment request when a client marks a project as completed.
 * Expects body: { amount: Number, freelancerId: ObjectId }
 */
exports.createPaymentRequest = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { amount, freelancerId } = req.body;

    const payment = await Payment.create({
      clientId: req.user?.id || new mongoose.Types.ObjectId(), // dummy if auth missing
      freelancerId,
      projectId,
      amount,
      status: 'requested',
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 2️⃣ Client reviews / approves the completed work.
 * Simply flips the status to "reviewed".
 */
exports.confirmProjectReview = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status: 'reviewed' },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 3️⃣ Execute payout – calls mock service then marks payment as paid.
 */
exports.executePayout = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    if (payment.status !== 'reviewed')
      return res.status(400).json({ error: 'Project must be reviewed before payout' });

    const result = await mockCharge(payment);
    if (!result.success) throw new Error('Mock charge failed');

    payment.status = 'paid';
    payment.transactionId = result.transactionId;
    await payment.save();

    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/* Backward‑compatible alias – some old code may still call createPayment */
exports.createPayment = async (req, res) => {
  return exports.createPaymentRequest(req, res);
};

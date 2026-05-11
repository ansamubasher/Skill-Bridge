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

/**
 * 4️⃣ Fetch all payments for the authenticated client.
 */
exports.getClientPayments = async (req, res) => {
  try {
    const clientId = req.user?.id || req.user?._id || req.user?.userId;
    console.log(`[getClientPayments] Auth Check: clientId=${clientId}, userObject=${JSON.stringify(req.user)}`);
    
    if (!clientId) return res.status(401).json({ error: 'Unauthorized: No User ID found in token' });

    const payments = await Payment.find({ clientId })
      .populate('projectId', 'title')
      .populate('freelancerId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    const formattedPayments = payments.map(p => ({
      ...p._doc,
      projectTitle: p.projectId?.title || 'Untitled Project',
      freelancerName: p.freelancerId?.name || 'Unknown Freelancer',
      clientName: p.clientId?.name || 'Unknown Client'
    }));

    res.json(formattedPayments);
  } catch (err) {
    console.error('[getClientPayments] FATAL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 5️⃣ Fetch all payments for the authenticated freelancer.
 */
exports.getFreelancerPayments = async (req, res) => {
  try {
    const freelancerId = req.user?.id || req.user?._id || req.user?.userId;
    console.log(`[getFreelancerPayments] Auth Check: freelancerId=${freelancerId}`);
    
    if (!freelancerId) return res.status(401).json({ error: 'Unauthorized: No User ID found in token' });

    const payments = await Payment.find({ freelancerId })
      .populate('projectId', 'title')
      .populate('freelancerId', 'name email')
      .populate('clientId', 'name email')
      .sort({ createdAt: -1 });

    const formattedPayments = payments.map(p => ({
      ...p._doc,
      projectTitle: p.projectId?.title || 'Untitled Project',
      freelancerName: p.freelancerId?.name || 'Unknown Freelancer',
      clientName: p.clientId?.name || 'Unknown Client'
    }));

    res.json(formattedPayments);
  } catch (err) {
    console.error('[getFreelancerPayments] FATAL ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

/* Backward‑compatible alias – some old code may still call createPayment */
exports.createPayment = async (req, res) => {
  return exports.createPaymentRequest(req, res);
};

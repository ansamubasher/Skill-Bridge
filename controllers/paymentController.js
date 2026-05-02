// Create payment (dummy or stripe)
exports.createPayment = async (req, res) => {
  try {
    const { amount } = req.body;

    const payment = await Payment.create({
      user: req.user.id,
      amount,
      status: "pending",
      paymentMethod: "stripe",
      transactionId: "dummy_" + Date.now()
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


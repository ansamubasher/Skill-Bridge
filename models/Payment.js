const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["requested", "reviewed", "paid"], default: "requested" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
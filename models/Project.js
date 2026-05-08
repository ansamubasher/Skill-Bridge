const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['tutoring', 'design', 'development', 'writing'],
      required: true,
    },
    requiredSkills: [String],
    budget: {
      type: Number,
      default: 0,
    },
    deadline: Date,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'completed', 'closed'],
      default: 'open',
    },
    bids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
    }],
    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
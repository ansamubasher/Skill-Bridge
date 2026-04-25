import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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

    requiredSkills: [String],

    budget: {
      min: Number,
      max: Number,
    },

    deadline: Date,

    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "closed"],
      default: "open",
    },

    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bid",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
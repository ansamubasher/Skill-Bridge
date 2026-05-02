const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },

    skills: [String],

    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    portfolio: [
      {
        type: String,
      },
    ],

    completedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    completionPercentage: {
      type: Number,
      default: 0,
    },

    coverImage: String,

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
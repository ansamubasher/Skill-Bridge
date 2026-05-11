const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: [String],
      enum: ["client", "freelancer"],
      default: ["client"],
    },

    department: String,
    academicYear: String,

    skills: [String],

    bio: {
      type: String,
      default: "",
    },

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
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
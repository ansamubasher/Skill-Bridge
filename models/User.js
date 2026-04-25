import mongoose from "mongoose";

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
        type: String, // links or file URLs
      },
    ],

    completedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
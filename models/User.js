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

    // Reference to user's profile document
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
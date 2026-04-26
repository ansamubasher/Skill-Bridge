import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One profile per user
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
        type: String, // links or file URLs
      },
    ],

    // Array of completed projects for portfolio
    completedProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    // Average rating from reviews (updated when reviews are created/deleted)
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    // Total number of reviews
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Profile completion percentage
    completionPercentage: {
      type: Number,
      default: 0,
    },

    // Cover image URL for profile
    coverImage: String,

    // Profile visibility
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);

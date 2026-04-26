import User from "../models/User.js";
import Profile from "../models/Profile.js";

// Get current user's profile (requires authentication)
export const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const profile = await Profile.findById(user.profile).populate("completedProjects", "title");

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Get another user's profile by their user ID (public endpoint)
export const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId format
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Check if profile is public
    const profile = await Profile.findById(user.profile);
    if (!profile.isPublic) {
      return res.status(403).json({
        success: false,
        message: "This profile is private",
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        bio: profile.bio,
        skills: profile.skills,
        portfolio: profile.portfolio,
        availability: profile.availability,
        rating: profile.rating,
        reviewCount: profile.reviewCount,
        completionPercentage: profile.completionPercentage,
        coverImage: profile.coverImage,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

// Update user profile (bio, skills, portfolio, availability, coverImage)
export const updateProfile = async (req, res) => {
  try {
    const { bio, portfolio, availability, coverImage } = req.body;
    const userId = req.user.id;

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Build update object
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (availability) updateData.availability = availability;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    // Validate availability enum
    if (availability && !["available", "busy", "offline"].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
      });
    }

    const updatedProfile = await Profile.findByIdAndUpdate(user.profile, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Add skill to profile's skills array
export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill || typeof skill !== "string" || skill.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill is required and must be a non-empty string",
      });
    }

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Add skill if not already exists ($addToSet prevents duplicates)
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { $addToSet: { skills: skill.trim() } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Skill added successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add skill",
      error: error.message,
    });
  }
};

// Remove skill from profile's skills array
export const removeSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: "Skill is required",
      });
    }

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Remove skill from array ($pull removes matching elements)
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { $pull: { skills: skill } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Skill removed successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove skill",
      error: error.message,
    });
  }
};

// Add portfolio item to profile
export const addPortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Portfolio URL is required",
      });
    }

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Add portfolio item
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { $addToSet: { portfolio: url } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Portfolio item added successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add portfolio item",
      error: error.message,
    });
  }
};

// Remove portfolio item from profile
export const removePortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Portfolio URL is required",
      });
    }

    // Find user's profile
    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Remove portfolio item
    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      { $pull: { portfolio: url } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Portfolio item removed successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove portfolio item",
      error: error.message,
    });
  }
};

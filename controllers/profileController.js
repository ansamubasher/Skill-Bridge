const User = require("../models/User");
const Profile = require("../models/Profile");

// Get current user's profile (requires authentication)
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user's profile
    const user = await User.findById(userId);
    if (!user ) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const profile = await Profile.findById(user).populate("completedProjects");

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
const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;

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

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { bio, portfolio, availability, coverImage } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (availability) updateData.availability = availability;
    if (coverImage !== undefined) updateData.coverImage = coverImage;

    if (availability && !["available", "busy", "offline"].includes(availability)) {
      return res.status(400).json({
        success: false,
        message: "Invalid availability status",
      });
    }

    const updatedProfile = await Profile.findByIdAndUpdate(
      user.profile,
      updateData,
      { new: true, runValidators: true }
    );

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

// Add skill
const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill || typeof skill !== "string" || skill.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill is required and must be a non-empty string",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

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

// Remove skill
const removeSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;

    if (!skill) {
      return res.status(400).json({
        success: false,
        message: "Skill is required",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

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

// Add portfolio
const addPortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Portfolio URL is required",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

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

// Remove portfolio
const removePortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Portfolio URL is required",
      });
    }

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

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

module.exports = {
  getMyProfile,
  getProfileById,
  updateProfile,
  addSkill,
  removeSkill,
  addPortfolioItem,
  removePortfolioItem,
};
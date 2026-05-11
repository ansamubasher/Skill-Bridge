const User = require("../models/User");
const Profile = require("../models/Profile");

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    let profile;
    if (!user.profile) {
      profile = await Profile.findOne({ user: userId }).populate("completedProjects");
      if (!profile) { profile = new Profile({ user: user._id }); await profile.save(); }
      user.profile = profile._id;
      await user.save();
    } else {
      profile = await Profile.findById(user.profile).populate("completedProjects");
      if (!profile) {
        profile = await Profile.findOne({ user: userId }).populate("completedProjects");
        if (!profile) { profile = new Profile({ user: user._id }); await profile.save(); }
        user.profile = profile._id;
        await user.save();
      }
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

const getProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) return res.status(400).json({ success: false, message: "Invalid user ID format" });
    const user = await User.findById(userId);
    if (!user || !user.profile) return res.status(404).json({ success: false, message: "Profile not found" });
    const profile = await Profile.findById(user.profile);
    if (!profile.isPublic) return res.status(403).json({ success: false, message: "This profile is private" });
    res.status(200).json({ success: true, profile: { bio: profile.bio, skills: profile.skills, portfolio: profile.portfolio, availability: profile.availability, rating: profile.rating, reviewCount: profile.reviewCount, completionPercentage: profile.completionPercentage, coverImage: profile.coverImage } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

const updateProfile = async (req, res) => {
  console.log('HIT updateProfile:', req.user.id, req.body);
  try {
    const { bio, portfolio, availability, coverImage, skills, workHistory, testimonials } = req.body;
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!user.profile) {
      let ep = await Profile.findOne({ user: userId });
      if (!ep) { ep = new Profile({ user: user._id }); await ep.save(); }
      user.profile = ep._id; await user.save();
    } else {
      const ep = await Profile.findById(user.profile);
      if (!ep) {
        let rp = await Profile.findOne({ user: userId });
        if (!rp) { rp = new Profile({ user: user._id }); await rp.save(); }
        user.profile = rp._id; await user.save();
      }
    }
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (portfolio !== undefined) updateData.portfolio = portfolio;
    if (skills !== undefined) updateData.skills = skills;
    if (workHistory !== undefined) updateData.workHistory = workHistory;
    if (testimonials !== undefined) updateData.testimonials = testimonials;
    if (availability) updateData.availability = availability;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (req.body.skills !== undefined) updateData.skills = req.body.skills;
    if (availability && !["available", "busy", "offline"].includes(availability)) {
      return res.status(400).json({ success: false, message: "Invalid availability status" });
    }
    const updatedProfile = await Profile.findOneAndUpdate({ user: userId }, updateData, { new: true, runValidators: true });
    if (!updatedProfile) {
      const newProfile = await Profile.create({ ...updateData, user: userId });
      return res.status(200).json({ success: true, message: "Profile created and updated", profile: newProfile });
    }
    res.status(200).json({ success: true, message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("updateProfile Error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;
    if (!skill || typeof skill !== "string" || skill.trim() === "") return res.status(400).json({ success: false, message: "Skill is required and must be a non-empty string" });
    const updatedProfile = await Profile.findOneAndUpdate({ user: userId }, { $addToSet: { skills: skill.trim() } }, { new: true });
    if (!updatedProfile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.status(200).json({ success: true, message: "Skill added successfully", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add skill", error: error.message });
  }
};

const removeSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    const userId = req.user.id;
    if (!skill) return res.status(400).json({ success: false, message: "Skill is required" });
    const updatedProfile = await Profile.findOneAndUpdate({ user: userId }, { $pull: { skills: skill } }, { new: true });
    if (!updatedProfile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.status(200).json({ success: true, message: "Skill removed successfully", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove skill", error: error.message });
  }
};

const addPortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;
    if (!url) return res.status(400).json({ success: false, message: "Portfolio URL is required" });
    const updatedProfile = await Profile.findOneAndUpdate({ user: userId }, { $addToSet: { portfolio: url } }, { new: true });
    if (!updatedProfile) return res.status(404).json({ success: false, message: "Profile not found" });
    res.status(200).json({ success: true, message: "Portfolio item added successfully", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add portfolio item", error: error.message });
  }
};

const removePortfolioItem = async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.user.id;
    if (!url) return res.status(400).json({ success: false, message: "Portfolio URL is required" });
    const user = await User.findById(userId);
    if (!user || !user.profile) return res.status(404).json({ success: false, message: "Profile not found" });
    const updatedProfile = await Profile.findByIdAndUpdate(user.profile, { $pull: { portfolio: url } }, { new: true });
    res.status(200).json({ success: true, message: "Portfolio item removed successfully", profile: updatedProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove portfolio item", error: error.message });
  }
};

module.exports = { getMyProfile, getProfileById, updateProfile, addSkill, removeSkill, addPortfolioItem, removePortfolioItem };
const Project = require("../models/Project");
const Bid = require("../models/Bid");

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, description, budget, requiredSkills, deadline, category } = req.body;

    const forbiddenWords = ["assignment", "homework"];
    const containsForbidden = forbiddenWords.some((word) =>
      description.toLowerCase().includes(word)
    );

    if (containsForbidden) {
      return res.status(400).json({
        success: false,
        message: "Description cannot contain 'assignment' or 'homework'",
      });
    }

    const validCategories = ["tutoring", "design", "development", "writing"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: " + validCategories.join(", "),
      });
    }

    const project = new Project({
      client: req.user.id || req.user._id,
      title,
      description,
      budget,
      requiredSkills,
      deadline,
      category,
    });

    await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// Get my projects
const getMyProjects = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const projects = await Project.find({ client: userId });

    res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// Get project by ID
const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id).populate("client", "name");

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, budget } = req.body;
    const userId = req.user.id || req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Only 'open' projects can be edited",
      });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (budget) project.budget = budget;

    await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// Update project status
const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    const validStatuses = ["in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    project.status = status;
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project status updated to ${status}`,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// Get project bids
const getProjectBids = async (req, res) => {
  try {
    const { id } = req.params;

    const bids = await Bid.find({ project: id }).populate("freelancer", "name");

    res.status(200).json({
      success: true,
      bids,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bids",
      error: error.message,
    });
  }
};

// Accept bid
const acceptProjectBid = async (req, res) => {
  try {
    const { id } = req.params;
    const { bidId } = req.body;
    const userId = req.user.id || req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    project.acceptedBid = bidId;
    project.status = "in_progress";
    await project.save();

    await Bid.findByIdAndUpdate(bidId, { status: "accepted" });

    await Bid.updateMany(
      { project: id, _id: { $ne: bidId } },
      { status: "rejected" }
    );

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to accept bid",
      error: error.message,
    });
  }
};

module.exports = {
  createProject,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectBids,
  acceptProjectBid,
};
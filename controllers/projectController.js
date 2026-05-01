import Project from "../models/Project.js";
import Bid from "../models/Bid.js";

// Create a new project
export const createProject = async (req, res) => {
  try {
    const { title, description, budget, requiredSkills, deadline, category } = req.body;

    // Validate description doesn't contain 'assignment' or 'homework'
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

    // Check that category is within ['tutoring', 'design', 'development', 'writing']
    const validCategories = ["tutoring", "design", "development", "writing"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category. Must be one of: " + validCategories.join(", "),
      });
    }

    // Save project using req.user.id (or req.user._id if provided) as the client
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

// Fetch all projects where the client field matches req.user.id
export const getMyProjects = async (req, res) => {
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

// Fetch a single project by ID and populate the client name
export const getProjectById = async (req, res) => {
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

// Allow the client to edit title, description, or budget if the project status is 'open'
export const updateProject = async (req, res) => {
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

    // Check ownership
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project",
      });
    }

    // Check status
    if (project.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "Only 'open' projects can be edited",
      });
    }

    // Update fields
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

// Allow the client to delete their own project
export const deleteProject = async (req, res) => {
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

    // Check ownership
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project",
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

// A PATCH request to change status to 'in_progress' or 'completed'
export const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id || req.user._id;

    const validStatuses = ["in_progress", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'in_progress' or 'completed'",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check ownership
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this project's status",
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
      message: "Failed to update project status",
      error: error.message,
    });
  }
};

// Fetch all bids from the Bid model where the projectId matches the project in the URL
export const getProjectBids = async (req, res) => {
  try {
    const { id } = req.params; // projectId

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

// Accept a project bid and update project status
export const acceptProjectBid = async (req, res) => {
  try {
    const { id } = req.params; // projectId
    const { bidId } = req.body;
    const userId = req.user.id || req.user._id;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check ownership
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept bids for this project",
      });
    }

    // Update Project
    project.acceptedBid = bidId;
    project.status = "in_progress";
    await project.save();

    // Bonus: Update the accepted Bid's status to 'accepted'
    await Bid.findByIdAndUpdate(bidId, { status: "accepted" });

    // Optional: Reject other bids
    await Bid.updateMany(
      { project: id, _id: { $ne: bidId } },
      { status: "rejected" }
    );

    res.status(200).json({
      success: true,
      message: "Bid accepted successfully and project status updated to in_progress",
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

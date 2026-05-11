const Project  = require('../models/Project');
const Bid      = require('../models/Bid');
const Contract = require('../models/Contract');
const Conversation = require('../models/Conversation');

// ── Create project (client) ───────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { title, description, budget, requiredSkills, deadline, category } = req.body;

    const forbidden = ['assignment', 'homework'];
    if (forbidden.some(w => description.toLowerCase().includes(w))) {
      return res.status(400).json({ success: false, message: "Description cannot contain 'assignment' or 'homework'" });
    }

    const validCategories = ['tutoring', 'design', 'development', 'writing'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid category. Must be one of: ' + validCategories.join(', ') });
    }

    if (deadline) {
      const dl = new Date(deadline);
      if (isNaN(dl.getTime()) || dl <= new Date()) {
        return res.status(400).json({ success: false, message: 'Deadline must be a future date' });
      }
    }

    const project = new Project({
      client: req.user.id || req.user._id,
      title, description, budget, requiredSkills, deadline, category,
    });

    await project.save();
    res.status(201).json({ success: true, message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: error.message });
  }
};

// ── Get ALL open projects (freelancer browse) ─────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { status: 'open' };
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    const projects = await Project.find(filter)
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
};

// ── Get MY projects (client) ──────────────────────────────────────────────────
const getMyProjects = async (req, res) => {
  try {
    const userId   = req.user.id || req.user._id;
    const projects = await Project.find({ client: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: error.message });
  }
};

// ── Get project by ID ─────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('client', 'name');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.status(200).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project', error: error.message });
  }
};

// ── Update project ────────────────────────────────────────────────────────────
const updateProject = async (req, res) => {
  try {
    const { title, description, budget } = req.body;
    const userId  = req.user.id || req.user._id;
    const project = await Project.findById(req.params.id);

    if (!project)                                            return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.client.toString() !== userId.toString())    return res.status(403).json({ success: false, message: 'Not authorized' });
    if (project.status !== 'open')                          return res.status(400).json({ success: false, message: "Only 'open' projects can be edited" });

    if (title)       project.title       = title;
    if (description) project.description = description;
    if (budget)      project.budget      = budget;
    await project.save();

    res.status(200).json({ success: true, message: 'Project updated', project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: error.message });
  }
};

// ── Delete project ────────────────────────────────────────────────────────────
const deleteProject = async (req, res) => {
  try {
    const userId  = req.user.id || req.user._id;
    const project = await Project.findById(req.params.id);

    if (!project)                                         return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.client.toString() !== userId.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    await Project.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: error.message });
  }
};

// ── Update project status ─────────────────────────────────────────────────────
const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const userId     = req.user.id || req.user._id;

    if (!['in_progress', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const project = await Project.findById(req.params.id);
    if (!project)                                         return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.client.toString() !== userId.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    project.status = status;
    await project.save();
    res.status(200).json({ success: true, message: `Status updated to ${status}`, project });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status', error: error.message });
  }
};

// ── Get bids for a project ────────────────────────────────────────────────────
const getProjectBids = async (req, res) => {
  try {
    const bids = await Bid.find({ project: req.params.id })
      .populate('freelancer', 'name email department academicYear');
    res.status(200).json({ success: true, bids });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bids', error: error.message });
  }
};

// ── Place a bid (freelancer) ──────────────────────────────────────────────────
const placeBid = async (req, res) => {
  try {
    const { bidAmount, coverLetter } = req.body;
    const freelancerId = req.user.id || req.user._id;
    const project = await Project.findById(req.params.id);

    if (!project)                  return res.status(404).json({ success: false, message: 'Project not found' });
    if (project.status !== 'open') return res.status(400).json({ success: false, message: 'Project is no longer accepting bids' });
    if (!bidAmount)                return res.status(400).json({ success: false, message: 'bidAmount is required' });
    if (Number(bidAmount) <= 0)    return res.status(400).json({ success: false, message: 'Bid amount must be a positive number' });

    // Prevent duplicate bids
    const existing = await Bid.findOne({ project: req.params.id, freelancer: freelancerId });
    if (existing) return res.status(409).json({ success: false, message: 'You have already placed a bid on this project' });

    const bid = new Bid({ project: req.params.id, freelancer: freelancerId, bidAmount, coverLetter: coverLetter || '' });
    await bid.save();

    await Project.findByIdAndUpdate(req.params.id, { $push: { bids: bid._id } });

    res.status(201).json({ success: true, message: 'Bid placed successfully', bid });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to place bid', error: error.message });
  }
};

// ── Accept a bid → creates a Contract ────────────────────────────────────────
const acceptProjectBid = async (req, res) => {
  try {
    const { bidId } = req.body;
    const userId    = req.user.id || req.user._id;
    const projectId = req.params.id;

    console.log(`[AcceptBid] Project: ${projectId}, Bid: ${bidId}, User: ${userId}`);

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    console.log(`[AcceptBid] Project Owner: ${project.client}`);
    if (project.client.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to accept bids for this project' });
    }

    const bid = await Bid.findById(bidId);
    if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

    console.log(`[AcceptBid] Bid Freelancer: ${bid.freelancer}, Amount: ${bid.bidAmount}`);

    // Create contract
    const contract = new Contract({
      project:      project._id,
      client:       project.client,
      freelancer:   bid.freelancer,
      bid:          bid._id,
      agreedAmount: bid.bidAmount,
      status:       'active'
    });
    await contract.save();
    console.log(`[AcceptBid] Contract created: ${contract._id}`);

    // Update project
    project.acceptedBid = bid._id;
    project.status      = 'in_progress';
    await project.save();

    // Mark bids
    await Bid.findByIdAndUpdate(bidId, { status: 'accepted' });
    await Bid.updateMany({ project: project._id, _id: { $ne: bidId } }, { status: 'rejected' });

    // Create conversation if it doesn't exist
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [project.client, bid.freelancer] },
      });
      
      if (!conversation) {
        await Conversation.create({
          participants: [project.client, bid.freelancer],
          lastMessage: "Project started! You can now communicate here.",
          lastMessageTime: new Date(),
        });
        console.log(`[AcceptBid] Conversation created`);
      }
    } catch (convErr) {
      console.error(`[AcceptBid] Conversation error (non-fatal):`, convErr.message);
    }

    res.status(200).json({ success: true, message: 'Bid accepted — contract created', contract, project });
  } catch (error) {
    console.error(`[AcceptBid] FATAL ERROR:`, error);
    res.status(500).json({ success: false, message: 'Failed to accept bid', error: error.message });
  }
};

// ── Get my contracts ──────────────────────────────────────────────────────────
const getMyContracts = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const contracts = await Contract.find({
      $or: [{ client: userId }, { freelancer: userId }],
    })
      .populate('project', 'title description status')
      .populate('client',     'name email')
      .populate('freelancer', 'name email')
      .populate('bid', 'bidAmount coverLetter')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, contracts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contracts', error: error.message });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getMyProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getProjectBids,
  placeBid,
  acceptProjectBid,
  getMyContracts,
};
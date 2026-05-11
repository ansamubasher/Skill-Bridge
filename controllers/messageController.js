const Message = require("../models/Message.js");
const Conversation = require("../models/Conversation.js");

// 1. sendMessage
const sendMessage = async (req, res) => {
  try {
    // Always take sender from req.user._id (populated by auth middleware)
    const sender = req.user._id;
    const { receiver, content, projectId } = req.body;

    if (!receiver || !content) {
      return res.status(400).json({ success: false, error: "Receiver and content are required" });
    }

    const newMessage = await Message.create({
      sender,
      receiver,
      content,
    });

    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (conversation) {
      conversation.lastMessage = content;
      conversation.lastMessageTime = new Date();
      if (projectId && !conversation.project) conversation.project = projectId;
      await conversation.save();
    } else {
      conversation = await Conversation.create({
        participants: [sender, receiver],
        lastMessage: content,
        lastMessageTime: new Date(),
        project: projectId,
      });
    }

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 2. getMessages
const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId: receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: receiverId },
        { sender: receiverId, receiver: currentUserId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessages:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

// 3. getUserConversations
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email")
      .populate("project", "title")
      .sort({ lastMessageTime: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUserConversations,
};
// 3. getUserConversations
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "_id name email")
      .populate("project", "title")
      .sort({ lastMessageTime: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getUserConversations:", error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUserConversations,
};

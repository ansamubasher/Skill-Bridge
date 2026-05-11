const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: String,
      default: "",
    },
    lastMessageTime: {
      type: Date,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  { 
    timestamps: true 
  }
);

// Create an index on the participants array to ensure efficient querying 
// when finding all conversations for a specific user.
conversationSchema.index({ participants: 1 });

module.exports = mongoose.model("Conversation", conversationSchema);

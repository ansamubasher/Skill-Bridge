const express = require("express");
const router = express.Router();
const { sendMessage, getMessages, getUserConversations } = require("../controllers/messageController.js");
const authMiddleware = require("../middlewares/authMiddleware.js");

// All message routes are protected
router.use(authMiddleware);

router.post("/send", sendMessage);
router.get("/conversations", getUserConversations);
router.get("/:userId", getMessages);

module.exports = router;

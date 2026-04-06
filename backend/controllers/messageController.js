const Message = require("../models/Message");

// @desc    Get all messages
// @route   GET /api/messages
const getMessages = async (req, res) => {
  try {
    // Fetch messages sorted by timestamp (oldest first)
    const messages = await Message.find().sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new message
// @route   POST /api/messages
const createMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Message content is required" });
    }

    const message = await Message.create({ content: content.trim() });

    // Emit real-time event to all connected clients
    const io = req.app.get("io");
    io.emit("newMessage", message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a message (for me OR for everyone)
// @route   DELETE /api/messages/:id
// @query   type=me&userId=xxx  OR  type=everyone
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, userId } = req.query;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    if (type === "me") {
      // "Delete for Me" — add this userId to the deletedFor array
      if (!userId) {
        return res.status(400).json({ error: "userId is required for delete-for-me" });
      }

      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }

      // Emit event — only the requesting user needs to react
      const io = req.app.get("io");
      io.emit("deleteMessage", { messageId: id, type: "me", userId });

    } else if (type === "everyone") {
      // "Delete for Everyone" — mark as globally deleted
      message.isDeletedForEveryone = true;
      await message.save();

      // Emit event — all users need to react
      const io = req.app.get("io");
      io.emit("deleteMessage", { messageId: id, type: "everyone" });

    } else {
      return res.status(400).json({ error: "Query param 'type' must be 'me' or 'everyone'" });
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Toggle pin/unpin a message
// @route   PATCH /api/messages/:id/pin
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Toggle the isPinned value
    message.isPinned = !message.isPinned;
    await message.save();

    // Emit event — all users see pin state change
    const io = req.app.get("io");
    io.emit("pinMessage", { messageId: id, isPinned: message.isPinned });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getMessages, createMessage, deleteMessage, togglePin };

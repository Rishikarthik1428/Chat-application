const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Message content is required"],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  deletedFor: {
    type: [String],   // Array of userIds who chose "Delete for Me"
    default: [],
  },
  isDeletedForEveryone: {
    type: Boolean,    // When true, message shows as deleted for all users
    default: false,
  },
  isPinned: {
    type: Boolean,    // When true, message is pinned in the chat
    default: false,
  },
});

module.exports = mongoose.model("Message", messageSchema);

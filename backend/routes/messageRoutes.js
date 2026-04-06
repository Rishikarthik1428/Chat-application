const express = require("express");
const router = express.Router();
const {
  getMessages,
  createMessage,
  deleteMessage,
  togglePin,
} = require("../controllers/messageController");

// GET  /api/messages         — Fetch all messages
router.get("/", getMessages);

// POST /api/messages         — Send a new message
router.post("/", createMessage);

// DELETE /api/messages/:id   — Delete a message (query: type=me|everyone)
router.delete("/:id", deleteMessage);

// PATCH /api/messages/:id/pin — Toggle pin on a message
router.patch("/:id/pin", togglePin);

module.exports = router;

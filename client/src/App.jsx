import { useState, useEffect } from "react";
import axios from "axios";
import socket from "./socket";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import PinnedMessages from "./components/PinnedMessages";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/messages`;

// Generate or retrieve a persistent userId for this browser
function getUserId() {
  let userId = localStorage.getItem("chatapp_userId");
  if (!userId) {
    userId = "user_" + Math.random().toString(36).substring(2, 10);
    localStorage.setItem("chatapp_userId", userId);
  }
  return userId;
}

function App() {
  const [messages, setMessages] = useState([]);
  const [userId] = useState(getUserId);

  // --- Fetch all messages on mount ---
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(API_URL);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }
    };
    fetchMessages();
  }, []);

  // --- Socket.IO event listeners ---
  useEffect(() => {
    // New message arrives
    socket.on("newMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Message deleted
    socket.on("deleteMessage", ({ messageId, type, userId: deletedByUserId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg._id !== messageId) return msg;

          if (type === "everyone") {
            return { ...msg, isDeletedForEveryone: true };
          }
          if (type === "me") {
            return { ...msg, deletedFor: [...msg.deletedFor, deletedByUserId] };
          }
          return msg;
        })
      );
    });

    // Message pinned/unpinned
    socket.on("pinMessage", ({ messageId, isPinned }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, isPinned } : msg
        )
      );
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off("newMessage");
      socket.off("deleteMessage");
      socket.off("pinMessage");
    };
  }, []);

  // --- Action handlers ---
  const handleSend = async (content) => {
    try {
      await axios.post(API_URL, { content });
      // Don't manually add to state — the socket "newMessage" event handles it
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/${messageId}?type=me&userId=${userId}`);
    } catch (err) {
      console.error("Failed to delete for me:", err);
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      await axios.delete(`${API_URL}/${messageId}?type=everyone`);
    } catch (err) {
      console.error("Failed to delete for everyone:", err);
    }
  };

  const handleTogglePin = async (messageId) => {
    try {
      await axios.patch(`${API_URL}/${messageId}/pin`);
    } catch (err) {
      console.error("Failed to toggle pin:", err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-avatar">💬</div>
          <div>
            <h1>ChatSphere</h1>
            <span className="header-status">
              <span className="status-dot"></span>
              Online
            </span>
          </div>
        </div>
      </header>

      <PinnedMessages messages={messages} />

      <ChatWindow
        messages={messages}
        userId={userId}
        onDeleteForMe={handleDeleteForMe}
        onDeleteForEveryone={handleDeleteForEveryone}
        onTogglePin={handleTogglePin}
      />

      <MessageInput onSend={handleSend} />
    </div>
  );
}

export default App;

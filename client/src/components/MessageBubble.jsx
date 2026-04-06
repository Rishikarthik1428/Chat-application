import { useState, useRef, useEffect } from "react";

function MessageBubble({ message, userId, onDeleteForMe, onDeleteForEveryone, onTogglePin }) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // If deleted for everyone, show placeholder
  if (message.isDeletedForEveryone) {
    return (
      <div className="message-bubble deleted-bubble">
        <p className="deleted-text">🚫 This message was deleted</p>
        <span className="timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    );
  }

  return (
    <div className={`message-bubble ${message.isPinned ? "pinned" : ""}`}>
      {message.isPinned && <span className="pin-badge">📌 Pinned</span>}

      <p className="message-content">{message.content}</p>

      <div className="message-footer">
        <span className="timestamp">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>

        <div className="message-actions" ref={menuRef}>
          <button
            className="action-trigger"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Message options"
          >
            ⋮
          </button>

          {showMenu && (
            <div className="action-menu">
              <button
                onClick={() => { onDeleteForMe(message._id); setShowMenu(false); }}
              >
                🗑️ Delete for Me
              </button>
              <button
                onClick={() => { onDeleteForEveryone(message._id); setShowMenu(false); }}
              >
                🗑️ Delete for Everyone
              </button>
              <button
                onClick={() => { onTogglePin(message._id); setShowMenu(false); }}
              >
                {message.isPinned ? "📌 Unpin" : "📌 Pin"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;

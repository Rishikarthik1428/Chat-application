import { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

function ChatWindow({ messages, userId, onDeleteForMe, onDeleteForEveryone, onTogglePin }) {
  const bottomRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Filter out messages the current user has deleted "for me"
  const visibleMessages = messages.filter(
    (msg) => !msg.deletedFor.includes(userId)
  );

  return (
    <div className="chat-window">
      {visibleMessages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        visibleMessages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            userId={userId}
            onDeleteForMe={onDeleteForMe}
            onDeleteForEveryone={onDeleteForEveryone}
            onTogglePin={onTogglePin}
          />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;

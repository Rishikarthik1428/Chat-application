function PinnedMessages({ messages }) {
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isDeletedForEveryone);

  if (pinnedMessages.length === 0) return null;

  return (
    <div className="pinned-panel">
      <h3 className="pinned-title">📌 Pinned Messages</h3>
      <div className="pinned-list">
        {pinnedMessages.map((msg) => (
          <div key={msg._id} className="pinned-item">
            <p>{msg.content}</p>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PinnedMessages;

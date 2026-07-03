import { getReactionSummary } from "../supabase/chatService";
import { useLongPress } from "../hooks/useLongPress";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatMessageBubble({
  msg,
  mine,
  partnerLabel,
  isSelected,
  onOpenMenu,
  onImageClick,
}) {
  const { longPressHandlers, wasLongPress, resetLongPress } = useLongPress(
    () => onOpenMenu(msg),
    { disabled: msg.pending },
  );

  const reactions = getReactionSummary(msg.reactions);

  return (
    <div className={`chat-bubble-row ${mine ? "mine" : "theirs"}`}>
      <div className={`chat-bubble-wrap ${reactions.length ? "has-reactions" : ""}`}>
        <div
          className={`chat-bubble ${msg.pending ? "pending" : ""} ${isSelected ? "selected" : ""}`}
          {...longPressHandlers}
        >
          {!mine && <span className="chat-sender">{partnerLabel}</span>}
          {msg.body && <p className="chat-body">{msg.body}</p>}
          {msg.image_url && (
            <button
              type="button"
              className="chat-image-link"
              onClick={(e) => {
                if (wasLongPress()) {
                  e.preventDefault();
                  resetLongPress();
                  return;
                }
                onImageClick(msg.image_url);
              }}
              aria-label="View image"
            >
              <img src={msg.image_url} alt="Shared" className="chat-image" />
            </button>
          )}
          <div className="chat-meta">
            <time>{formatTime(msg.created_at)}</time>
          </div>
        </div>
        {reactions.length > 0 && (
          <div className="chat-reactions" aria-label="Reactions">
            <span
              className={`chat-reaction-badge ${reactions.length === 1 ? "single" : ""}`}
            >
              {reactions.map(({ emoji }) => (
                <span key={emoji} className="chat-reaction-emoji">
                  {emoji}
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

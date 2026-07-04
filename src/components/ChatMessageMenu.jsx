import { MapPin, Pencil, Reply, Trash2 } from "lucide-react";
import { Icon } from "./Icon";

export const CHAT_REACTIONS = ["❤️", "😂", "😮", "😢", "🙏", "👍"];

export default function ChatMessageMenu({
  message,
  currentSender,
  mine,
  canEdit,
  showLocation = false,
  onClose,
  onDelete,
  onEdit,
  onReact,
  onReply,
  onViewLocation,
}) {
  const myReaction = message.reactions?.[currentSender];

  return (
    <div className="chat-message-menu" role="dialog" aria-modal="true" aria-label="Message options">
      <button
        type="button"
        className="chat-menu-backdrop"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div className="chat-message-menu-card">
        <div className="chat-message-menu-reactions">
          {CHAT_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`chat-reaction-btn ${myReaction === emoji ? "active" : ""}`}
              onClick={() => onReact(emoji)}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
        <button type="button" className="chat-menu-reply" onClick={onReply}>
          <Icon icon={Reply} size={18} />
          Reply
        </button>
        <div className="chat-message-menu-actions">
          {showLocation && !mine && (
            <button type="button" className="chat-menu-action" onClick={onViewLocation}>
              <Icon icon={MapPin} size={18} />
              Location
            </button>
          )}
          {canEdit && (
            <button type="button" className="chat-menu-action" onClick={onEdit}>
              <Icon icon={Pencil} size={18} />
              Edit
            </button>
          )}
          {mine && (
            <button
              type="button"
              className="chat-menu-action chat-menu-action-danger"
              onClick={onDelete}
            >
              <Icon icon={Trash2} size={18} />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

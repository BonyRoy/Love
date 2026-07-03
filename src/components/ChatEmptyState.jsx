import { Heart, MessageCircle } from "lucide-react";
import { Icon } from "./Icon";

export default function ChatEmptyState() {
  return (
    <div className="chat-empty-state">
      <div className="chat-empty-visual" aria-hidden="true">
        <span className="chat-ripple chat-ripple-1" />
        <span className="chat-ripple chat-ripple-2" />
        <span className="chat-ripple chat-ripple-3" />
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="chat-orbit-heart"
            style={{ "--orbit-i": i }}
          >
            <Icon icon={Heart} size={14} fill="currentColor" />
          </span>
        ))}
        <div className="chat-empty-core">
          <Icon icon={MessageCircle} size={36} strokeWidth={1.75} />
        </div>
      </div>
      <p className="chat-empty-label">Send a message or photo to begin</p>
    </div>
  );
}

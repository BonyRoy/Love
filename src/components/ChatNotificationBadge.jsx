export default function ChatNotificationBadge({ count, className = "" }) {
  if (!count || count <= 0) return null;

  const label = count > 99 ? "99+" : String(count);

  return (
    <span
      className={`chat-notify-badge ${className}`.trim()}
      aria-label={`${count} unread messages`}
    >
      {label}
    </span>
  );
}

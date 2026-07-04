import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { Icon } from "./Icon";
import ChatNotificationBadge from "./ChatNotificationBadge";
import { useUnreadChatCount } from "../hooks/useUnreadChatCount";

const POS_KEY = "ishu-admin-bell-pos";
const SIZE = 56;

function loadPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(POS_KEY));
    if (saved?.x != null && saved?.y != null) return saved;
  } catch {
    // ignore
  }
  return {
    x: window.innerWidth - SIZE - 20,
    y: window.innerHeight - SIZE - 180,
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export default function AdminChatBell() {
  const navigate = useNavigate();
  const location = useLocation();
  const inChat = location.pathname === "/admin/chat";
  const unread = useUnreadChatCount("admin", { pause: inChat });
  const [pos, setPos] = useState(loadPosition);
  const posRef = useRef(pos);
  posRef.current = pos;
  const drag = useRef({
    active: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    const onResize = () => {
      setPos((p) => ({
        x: clamp(p.x, 8, window.innerWidth - SIZE - 8),
        y: clamp(p.y, 8, window.innerHeight - SIZE - 8),
      }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (inChat) return null;

  const onPointerDown = (e) => {
    drag.current = {
      active: true,
      moved: false,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: pos.x,
      originY: pos.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) drag.current.moved = true;
    const next = {
      x: clamp(drag.current.originX + dx, 8, window.innerWidth - SIZE - 8),
      y: clamp(drag.current.originY + dy, 8, window.innerHeight - SIZE - 8),
    };
    setPos(next);
  };

  const onPointerUp = (e) => {
    if (!drag.current.active || drag.current.pointerId !== e.pointerId) return;
    drag.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
    localStorage.setItem(POS_KEY, JSON.stringify(posRef.current));
    if (!drag.current.moved) navigate("/admin/chat");
  };

  return (
    <div
      className="admin-bell-wrap"
      style={{ left: pos.x, top: pos.y }}
    >
      <button
        type="button"
        className="admin-bell-fab"
        aria-label={
          unread > 0 ? `Open chat, ${unread} unread messages` : "Open chat"
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <Icon icon={Bell} size={26} />
      </button>
      <ChatNotificationBadge count={unread} />
    </div>
  );
}

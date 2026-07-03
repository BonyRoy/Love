import { useState } from "react";
import { Heart } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

export default function SecretHeart() {
  const { secretHeart } = useContent();
  const messages = secretHeart.messages;
  const [clicks, setClicks] = useState(0);
  const [burst, setBurst] = useState(false);

  const handleClick = () => {
    const next = clicks + 1;
    setClicks(next);
    if (next % 3 === 0) {
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
  };

  const message =
    clicks === 0 ? null : messages[Math.min(clicks - 1, messages.length - 1)];

  return (
    <div className="secret-heart-section">
      <button
        className={`secret-heart ${burst ? "burst" : ""}`}
        onClick={handleClick}
        aria-label="Secret heart"
      >
        <Icon icon={Heart} size={48} fill="currentColor" />
      </button>
      {message && <p className="secret-message">{message}</p>}
      {clicks === 0 && <p className="secret-hint">{secretHeart.hint}</p>}
      {clicks >= messages.length && (
        <p className="secret-final">
          {secretHeart.final}
          <Icon icon={Heart} size={16} className="secret-final-icon" />
        </p>
      )}
    </div>
  );
}

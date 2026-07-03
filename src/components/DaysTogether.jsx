import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";

const ADMIN_CLICKS = 20;
const CLICK_RESET_MS = 3000;

const HEART_PATH =
  "M65 110 C65 110 6 72 6 42 C6 20 22 6 40 6 C52 6 60 15 65 27 C70 15 78 6 90 6 C108 6 124 20 124 42 C124 72 65 110 65 110 Z";

function getDaysTogether(startDate) {
  const start = new Date(startDate);
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = now - start;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export default function DaysTogether() {
  const navigate = useNavigate();
  const { OUR_START_DATE, daysHero } = useContent();
  const days = getDaysTogether(OUR_START_DATE);
  const [adminClicks, setAdminClicks] = useState(0);
  const resetTimer = useRef(null);

  const handleHeartClick = () => {
    clearTimeout(resetTimer.current);
    const next = adminClicks + 1;
    if (next >= ADMIN_CLICKS) {
      navigate("/admin/login");
      return;
    }
    setAdminClicks(next);
    resetTimer.current = setTimeout(() => setAdminClicks(0), CLICK_RESET_MS);
  };

  return (
    <div className="days-hero">
      <div className="days-hero-content">
        <div className="days-welcome">
          <h1>{daysHero.greeting}</h1>
          <p>{daysHero.subtitle}</p>
        </div>

        <button
          type="button"
          className="days-heart-wrap"
          onClick={handleHeartClick}
          aria-label={`${days} days together`}
        >
          <svg
            className="days-heart-svg"
            viewBox="0 0 130 118"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="heartGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#f368b5" />
                <stop offset="50%" stopColor="#e84393" />
                <stop offset="100%" stopColor="#7c5ce7" />
              </linearGradient>
            </defs>
            <path
              className="days-heart-shape"
              d={HEART_PATH}
              fill="url(#heartGrad)"
              stroke="white"
              strokeWidth="4"
              strokeLinejoin="round"
            />
          </svg>
          <div className="days-heart-text">
            <span className="days-count">{days.toLocaleString()}</span>
            <span className="days-unit">days</span>
            <span className="days-label">{daysHero.daysLabel}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

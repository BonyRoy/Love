import { useContent } from "../context/ContentContext";

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
  const { OUR_START_DATE, daysHero } = useContent();
  const days = getDaysTogether(OUR_START_DATE);

  return (
    <div className="days-hero">
      <div className="days-hero-content">
        <div className="days-welcome">
          <h1>{daysHero.greeting}</h1>
          <p>{daysHero.subtitle}</p>
        </div>

        <div className="days-heart-wrap">
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
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Zap, ArrowLeft, RotateCcw, Heart } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

const GAME_SECONDS = 10;

function loadHighScore(key) {
  try {
    const saved = localStorage.getItem(key);
    const n = parseInt(saved, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export default function HeartRush() {
  const { heartRushMessages, storageKeys } = useContent();
  const highScoreKey = storageKeys.heartRushHighScore;
  const [taps, setTaps] = useState(0);
  const [highScore, setHighScore] = useState(() => loadHighScore(highScoreKey));
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [phase, setPhase] = useState("idle");
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [pulse, setPulse] = useState(false);
  const tapsRef = useRef(0);

  const start = () => {
    setTaps(0);
    tapsRef.current = 0;
    setTimeLeft(GAME_SECONDS);
    setIsNewRecord(false);
    setPhase("playing");
  };

  const tap = () => {
    if (phase !== "playing") return;
    tapsRef.current += 1;
    setTaps(tapsRef.current);
    setPulse(true);
    setTimeout(() => setPulse(false), 80);
  };

  useEffect(() => {
    if (phase !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("done");
          const final = tapsRef.current;
          if (final > highScore) {
            setHighScore(final);
            setIsNewRecord(true);
            try {
              localStorage.setItem(highScoreKey, String(final));
            } catch {
              // ignore
            }
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, highScore]);

  const getMessage = () => {
    const tier = heartRushMessages.find((entry) => taps >= entry.minTaps);
    return tier?.message ?? "";
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Zap} size={22} className="section-title-icon" />
          Heart Rush
        </h2>
        <p className="section-sub">
          Tap the heart as fast as you can in 10 seconds!
        </p>

        <div className="game-stats">
          <span>
            Taps: <strong>{taps}</strong>
          </span>
          <span>
            Best: <strong>{highScore}</strong>
          </span>
          <span>
            Time: <strong>{timeLeft}s</strong>
          </span>
        </div>

        <div className="rush-arena">
          {phase === "idle" && (
            <div className="game-overlay">
              <p>Mash the heart — go go go!</p>
              {highScore > 0 && (
                <p className="game-high-score-hint">Best: {highScore} taps</p>
              )}
              <button className="btn-primary" onClick={start}>
                Start
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="game-overlay">
              <p className="game-result-score">{taps} taps!</p>
              {isNewRecord && (
                <p className="game-new-record">New high score!</p>
              )}
              <p className="game-result-msg">{getMessage()}</p>
              <button className="btn-primary" onClick={start}>
                <Icon icon={RotateCcw} size={18} />
                Play Again
              </button>
            </div>
          )}

          {phase === "playing" && (
            <button
              type="button"
              className={`rush-heart ${pulse ? "pulse" : ""}`}
              onPointerDown={(e) => {
                e.preventDefault();
                tap();
              }}
              aria-label="Tap heart"
            >
              <Icon icon={Heart} size={72} fill="currentColor" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

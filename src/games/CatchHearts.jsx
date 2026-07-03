import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Heart, RotateCcw, ArrowLeft } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

const GAME_SECONDS = 20;
const HEART_LIFETIME = 1800;
const SPAWN_EVERY = 900;

function loadHighScore(key) {
  try {
    const saved = localStorage.getItem(key);
    const n = parseInt(saved, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export default function CatchHearts() {
  const { storageKeys } = useContent();
  const highScoreKey = storageKeys.catchHeartsHighScore;
  const [hearts, setHearts] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => loadHighScore(highScoreKey));
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [phase, setPhase] = useState("idle"); // idle | playing | done
  const idRef = useRef(0);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const removeHeart = (id) => {
    setHearts((prev) => prev.filter((h) => h.id !== id));
  };

  const spawnHeart = () => {
    const id = idRef.current++;
    const heart = {
      id,
      left: 8 + Math.random() * 76,
      top: 8 + Math.random() * 76,
    };

    setHearts((prev) => [...prev, heart]);

    const timeout = setTimeout(() => removeHeart(id), HEART_LIFETIME);
    timeoutsRef.current.push(timeout);
  };

  const start = () => {
    clearAllTimeouts();
    setHearts([]);
    setScore(0);
    setIsNewRecord(false);
    setTimeLeft(GAME_SECONDS);
    setPhase("playing");
    idRef.current = 0;
  };

  const catchHeart = (id) => {
    removeHeart(id);
    setScore((s) => s + 1);
  };

  useEffect(() => {
    if (phase !== "playing") return;

    spawnHeart();
    const spawnTimer = setInterval(spawnHeart, SPAWN_EVERY);
    const countdown = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("done");
          setHearts([]);
          clearAllTimeouts();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnTimer);
      clearInterval(countdown);
      clearAllTimeouts();
    };
  }, [phase]);

  useEffect(() => () => clearAllTimeouts(), []);

  useEffect(() => {
    if (phase !== "done") return;
    if (score > highScore) {
      setHighScore(score);
      setIsNewRecord(true);
      try {
        localStorage.setItem(highScoreKey, String(score));
      } catch {
        // ignore storage errors
      }
    }
  }, [phase, score, highScore, highScoreKey]);

  const getMessage = () => {
    if (score >= 15) return "Heart-catching champion!";
    if (score >= 8) return "Great job — those are fast fingers!";
    if (score >= 3) return "Nice! Try again to beat your score.";
    return "Hearts are sneaky — give it another go!";
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Heart} size={22} className="section-title-icon" />
          Catch the Hearts
        </h2>
        <p className="section-sub">Tap the hearts before they fade away!</p>

        <div className="game-stats">
          <span>
            Score: <strong>{score}</strong>
          </span>
          <span>
            Best: <strong>{highScore}</strong>
          </span>
          <span>
            Time: <strong>{timeLeft}s</strong>
          </span>
        </div>

        <div className="catch-arena">
          {phase === "idle" && (
            <div className="game-overlay">
              <p>Hearts pop up — tap them fast!</p>
              {highScore > 0 && (
                <p className="game-high-score-hint">Best score: {highScore}</p>
              )}
              <button className="btn-primary" onClick={start}>
                Start
              </button>
            </div>
          )}

          {phase === "done" && (
            <div className="game-overlay">
              <p className="game-result-score">{score} caught!</p>
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

          {phase === "playing" &&
            hearts.map((h) => (
              <button
                key={h.id}
                type="button"
                className="catch-heart"
                style={{ left: `${h.left}%`, top: `${h.top}%` }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  catchHeart(h.id);
                }}
                aria-label="Catch heart"
              >
                <Icon icon={Heart} size={36} fill="currentColor" />
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}

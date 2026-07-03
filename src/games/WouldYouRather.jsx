import { useState } from "react";
import { Link } from "react-router-dom";
import { Scale, ArrowLeft, RotateCcw } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function WouldYouRather() {
  const { wouldYouRather } = useContent();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);

  const round = wouldYouRather[index];

  const choose = (side) => {
    if (picked) return;
    setPicked(side);
  };

  const next = () => {
    setIndex((i) => (i + 1) % wouldYouRather.length);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Scale} size={22} className="section-title-icon" />
          Would You Rather
        </h2>
        <p className="section-sub">
          Round {index + 1} of {wouldYouRather.length}
        </p>

        <div className="wyr-options">
          <button
            className={`wyr-btn ${picked === "a" ? "picked" : ""}`}
            onClick={() => choose("a")}
            disabled={!!picked}
          >
            {round.a}
          </button>
          <span className="wyr-or">or</span>
          <button
            className={`wyr-btn ${picked === "b" ? "picked" : ""}`}
            onClick={() => choose("b")}
            disabled={!!picked}
          >
            {round.b}
          </button>
        </div>

        {picked && (
          <div className="wyr-result">
            <p>{round.reaction}</p>
            <div className="wyr-actions">
              <button className="btn-primary" onClick={next}>
                Next Round
              </button>
              <button className="btn-secondary" onClick={restart}>
                <Icon icon={RotateCcw} size={16} />
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

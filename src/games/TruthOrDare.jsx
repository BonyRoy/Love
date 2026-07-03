import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default function TruthOrDare() {
  const { truths, dares } = useContent();
  const [mode, setMode] = useState(null);
  const [card, setCard] = useState(null);

  const draw = (type) => {
    setMode(type);
    setCard(pickRandom(type === "truth" ? truths : dares));
  };

  const again = () => {
    setCard(pickRandom(mode === "truth" ? truths : dares));
  };

  const reset = () => {
    setMode(null);
    setCard(null);
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={MessageCircle} size={22} className="section-title-icon" />
          Truth or Dare
        </h2>
        <p className="section-sub">
          Sweet edition — nothing too wild, promise.
        </p>

        {!mode && (
          <div className="tod-pick">
            <button className="tod-btn truth" onClick={() => draw("truth")}>
              Truth
            </button>
            <button className="tod-btn dare" onClick={() => draw("dare")}>
              Dare
            </button>
          </div>
        )}

        {card && (
          <div className={`tod-card ${mode}`}>
            <span className="tod-label">
              {mode === "truth" ? "Truth" : "Dare"}
            </span>
            <p>{card}</p>
            <div className="tod-actions">
              <button className="btn-primary" onClick={again}>
                Another one
              </button>
              <button className="btn-secondary" onClick={reset}>
                Pick again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

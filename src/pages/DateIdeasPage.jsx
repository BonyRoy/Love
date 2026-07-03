import { useState } from "react";
import { MapPin, Shuffle } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function DateIdeasPage() {
  const { dateIdeas } = useContent();
  const [idea, setIdea] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const pick = () => {
    if (spinning) return;
    setSpinning(true);
    setIdea(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setIdea(dateIdeas[Math.floor(Math.random() * dateIdeas.length)]);
      ticks++;
      if (ticks > 10) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 70);
  };

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={MapPin} size={32} className="page-hero-icon" />
        <h1>Date Ideas</h1>
        <p>Stuck on plans? Let fate decide our next adventure.</p>
      </div>

      <div className="section">
        <div className="date-idea-display">
          {idea ? (
            <p className={spinning ? "spinning" : "revealed"}>{idea}</p>
          ) : (
            <p className="date-idea-placeholder">Tap below for a date idea!</p>
          )}
        </div>

        <button className="btn-primary" onClick={pick} disabled={spinning}>
          <Icon icon={Shuffle} size={18} />
          {spinning ? "Thinking..." : "Surprise me!"}
        </button>
      </div>
    </div>
  );
}

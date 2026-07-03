import { useState } from "react";
import { Smile } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function MoodPage() {
  const { moodResponses } = useContent();
  const moods = Object.entries(moodResponses);
  const [selected, setSelected] = useState(null);

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={Smile} size={32} className="page-hero-icon" />
        <h1>How are you feeling?</h1>
        <p>Tap your mood — I'll send the right kind of love.</p>
      </div>

      <div className="mood-grid">
        {moods.map(([key, mood]) => (
          <button
            key={key}
            type="button"
            className={`mood-btn ${selected === key ? "active" : ""}`}
            onClick={() => setSelected(key)}
          >
            <span className="mood-emoji">{mood.emoji}</span>
            <span className="mood-label">{mood.label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mood-response">
          <p>{moodResponses[selected].message}</p>
        </div>
      )}
    </div>
  );
}

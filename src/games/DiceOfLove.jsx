import { useState } from "react";
import { Link } from "react-router-dom";
import { Dices, ArrowLeft } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function DiceOfLove() {
  const { wheelPrizes } = useContent();
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);
  const [result, setResult] = useState(null);

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setResult(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setValue(1 + Math.floor(Math.random() * 6));
      ticks++;
      if (ticks > 14) {
        clearInterval(interval);
        const final = 1 + Math.floor(Math.random() * 6);
        setValue(final);
        setResult(wheelPrizes[final % wheelPrizes.length]);
        setRolling(false);
      }
    }, 80);
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Dices} size={22} className="section-title-icon" />
          Dice of Love
        </h2>
        <p className="section-sub">Roll the dice — fate picks your surprise!</p>

        <div className={`dice ${rolling ? "rolling" : ""}`}>
          <span className="dice-face">{value}</span>
        </div>

        <button className="btn-primary" onClick={roll} disabled={rolling}>
          {rolling ? "Rolling..." : "Roll!"}
        </button>

        {result && (
          <div className="wheel-result">
            <p className="wheel-result-label">The universe says:</p>
            <p className="wheel-result-prize">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

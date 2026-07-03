import { useState } from "react";
import { Gift, Sparkles } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

export default function ComplimentMachine() {
  const { compliments } = useContent();
  const [text, setText] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const generate = () => {
    if (spinning) return;
    setSpinning(true);
    setText(null);

    let ticks = 0;
    const interval = setInterval(() => {
      setText(compliments[Math.floor(Math.random() * compliments.length)]);
      ticks++;
      if (ticks > 12) {
        clearInterval(interval);
        setSpinning(false);
      }
    }, 80);
  };

  return (
    <section className="section compliment-machine">
      <h2 className="section-title">
        <Icon icon={Gift} size={22} className="section-title-icon" />
        Compliment Machine
      </h2>
      <p className="section-sub">Press the button. Receive love. Repeat.</p>

      <div className="machine-display">
        {text ? (
          <p className={`machine-text ${spinning ? "spinning" : "revealed"}`}>
            {text}
          </p>
        ) : (
          <p className="machine-placeholder">
            <Icon icon={Sparkles} size={18} className="placeholder-icon" />
            Your compliment awaits
            <Icon icon={Sparkles} size={18} className="placeholder-icon" />
          </p>
        )}
      </div>

      <button className="btn-primary" onClick={generate} disabled={spinning}>
        {spinning ? (
          "Thinking of you..."
        ) : (
          <>
            <Icon icon={Gift} size={18} />
            Give me a compliment
          </>
        )}
      </button>
    </section>
  );
}

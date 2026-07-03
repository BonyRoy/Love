import { useState } from "react";
import { Link } from "react-router-dom";
import { CircleDot, ArrowLeft } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function SpinWheel() {
  const { wheelPrizes } = useContent();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const winner = Math.floor(Math.random() * wheelPrizes.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3);
    const segmentAngle = 360 / wheelPrizes.length;
    const targetRotation =
      rotation + extraSpins * 360 + winner * segmentAngle + segmentAngle / 2;

    setRotation(targetRotation);

    setTimeout(() => {
      setSpinning(false);
      setResult(wheelPrizes[winner]);
    }, 4000);
  };

  const colors = wheelPrizes.map(
    (_, i) => `hsl(${(i * 360) / wheelPrizes.length}, 75%, 78%)`,
  );

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={CircleDot} size={22} className="section-title-icon" />
          Spin the Wheel
        </h2>
        <p className="section-sub">
          Spin for a surprise — redeemable with hugs!
        </p>

        <div className="wheel-container">
          <div className="wheel-pointer">▼</div>
          <div
            className="wheel"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                : "none",
              background: `conic-gradient(${colors
                .map((c, i) => {
                  const start = (i / wheelPrizes.length) * 100;
                  const end = ((i + 1) / wheelPrizes.length) * 100;
                  return `${c} ${start}% ${end}%`;
                })
                .join(", ")})`,
            }}
          >
            <div className="wheel-center">💝</div>
          </div>
        </div>

        <button className="btn-primary" onClick={spin} disabled={spinning}>
          {spinning ? "Spinning..." : "Spin!"}
        </button>

        {result && (
          <div className="wheel-result">
            <p className="wheel-result-label">You won:</p>
            <p className="wheel-result-prize">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}

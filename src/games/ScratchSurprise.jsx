import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, RotateCcw } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

export default function ScratchSurprise() {
  const { scratchPrizes } = useContent();
  const canvasRef = useRef(null);
  const [prize, setPrize] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const scratchingRef = useRef(false);

  const newCard = useCallback(() => {
    setPrize(scratchPrizes[Math.floor(Math.random() * scratchPrizes.length)]);
    setRevealed(false);
  }, [scratchPrizes]);

  useEffect(() => {
    newCard();
  }, [newCard]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !prize) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const w = 300;
    const h = 160;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "#dfe6e9");
    gradient.addColorStop(1, "#b2bec3");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#636e72";
    ctx.font = "600 14px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch here!", w / 2, h / 2);
  }, [prize]);

  const scratch = (e) => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const ctx = canvas.getContext("2d");
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let cleared = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) cleared++;
    }
    if (cleared / (imageData.data.length / 4) > 0.45) {
      setRevealed(true);
    }
  };

  const onPointerDown = (e) => {
    scratchingRef.current = true;
    scratch(e);
  };

  const onPointerMove = (e) => {
    if (!scratchingRef.current) return;
    scratch(e);
  };

  const onPointerUp = () => {
    scratchingRef.current = false;
  };

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={Sparkles} size={22} className="section-title-icon" />
          Scratch Surprise
        </h2>
        <p className="section-sub">Scratch the card to reveal your prize!</p>

        <div className="scratch-wrap">
          <div className="scratch-prize">{prize}</div>
          {!revealed && (
            <canvas
              ref={canvasRef}
              className="scratch-canvas"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            />
          )}
          {revealed && <div className="scratch-revealed-badge">Revealed!</div>}
        </div>

        {revealed && (
          <button className="btn-primary" onClick={newCard}>
            <Icon icon={RotateCcw} size={18} />
            New Card
          </button>
        )}
      </div>
    </div>
  );
}

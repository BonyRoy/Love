import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LayoutGrid, ArrowLeft, RotateCcw } from "lucide-react";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBoard(symbols) {
  const pairs = symbols.slice(0, 6);
  const cards = shuffle(
    pairs.flatMap((symbol, i) => [
      { id: `${i}a`, symbol, pairId: i },
      { id: `${i}b`, symbol, pairId: i },
    ]),
  );
  return cards;
}

export default function MemoryMatch() {
  const { memorySymbols } = useContent();
  const [cards, setCards] = useState(() => createBoard(memorySymbols));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [won, setWon] = useState(false);

  const restart = () => {
    setCards(createBoard(memorySymbols));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setLocked(false);
    setWon(false);
  };

  const flip = (index) => {
    if (locked || flipped.includes(index) || matched.has(cards[index].pairId))
      return;

    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (cards[a].pairId === cards[b].pairId) {
        setMatched((prev) => new Set([...prev, cards[a].pairId]));
        setFlipped([]);
        setLocked(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 800);
      }
    }
  };

  useEffect(() => {
    if (matched.size === 6) setWon(true);
  }, [matched]);

  return (
    <div className="page game-page">
      <Link to="/games" className="back-link">
        <Icon icon={ArrowLeft} size={16} />
        Back to games
      </Link>

      <div className="section game-section">
        <h2 className="section-title">
          <Icon icon={LayoutGrid} size={22} className="section-title-icon" />
          Memory Match
        </h2>
        <p className="section-sub">
          Moves: <strong>{moves}</strong>
          {won && " — You did it!"}
        </p>

        <div className="memory-grid">
          {cards.map((card, i) => {
            const isFlipped = flipped.includes(i) || matched.has(card.pairId);
            return (
              <button
                key={card.id}
                className={`memory-card ${isFlipped ? "flipped" : ""} ${matched.has(card.pairId) ? "matched" : ""}`}
                onClick={() => flip(i)}
                disabled={won}
              >
                <span className="memory-front">?</span>
                <span className="memory-back">{card.symbol}</span>
              </button>
            );
          })}
        </div>

        {won && (
          <div className="memory-win">
            <p>All pairs found in {moves} moves!</p>
            <button className="btn-primary" onClick={restart}>
              <Icon icon={RotateCcw} size={18} />
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

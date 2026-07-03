import { useMemo } from "react";
import { Heart } from "lucide-react";

export default function FloatingHearts({ count = 15 }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${6 + Math.random() * 8}s`,
        size: `${12 + Math.random() * 16}px`,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    [count],
  );

  return (
    <div className="floating-hearts" aria-hidden="true">
      {hearts.map((h) => (
        <Heart
          key={h.id}
          className="floating-heart"
          fill="currentColor"
          strokeWidth={1.5}
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
            width: h.size,
            height: h.size,
            opacity: h.opacity,
          }}
        />
      ))}
    </div>
  );
}

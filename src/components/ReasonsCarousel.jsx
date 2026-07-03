import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

export default function ReasonsCarousel() {
  const { reasons } = useContent();
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? reasons.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === reasons.length - 1 ? 0 : i + 1));

  return (
    <section className="section reasons">
      <h2 className="section-title">
        <Icon icon={Heart} size={22} className="section-title-icon" />
        Reasons I Love You
      </h2>
      <p className="section-sub">
        Reason #{index + 1} of {reasons.length}
      </p>

      <div className="carousel">
        <button className="carousel-btn" onClick={prev} aria-label="Previous">
          <Icon icon={ChevronLeft} size={22} />
        </button>

        <div className="carousel-card" key={index}>
          <span className="card-number">{index + 1}</span>
          <p>{reasons[index]}</p>
        </div>

        <button className="carousel-btn" onClick={next} aria-label="Next">
          <Icon icon={ChevronRight} size={22} />
        </button>
      </div>

      <div className="dots">
        {reasons.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to reason ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

import { useState } from "react";
import { CloudRain, Heart, Laugh, Mail, MapPin } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

const LETTER_ICONS = [CloudRain, MapPin, Laugh, Heart];

export default function OpenWhenLetters() {
  const { openWhen } = useContent();
  const [opened, setOpened] = useState(new Set());

  const toggle = (i) => {
    setOpened((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <section className="section letters">
      <h2 className="section-title">
        <Icon icon={Mail} size={22} className="section-title-icon" />
        Open When...
      </h2>
      <p className="section-sub">Little letters for whenever you need them</p>

      <div className="letter-grid">
        {openWhen.map((letter, i) => (
          <button
            key={i}
            className={`letter-envelope ${opened.has(i) ? "open" : ""}`}
            onClick={() => toggle(i)}
          >
            <div className="envelope-flap" />
            <div className="envelope-body">
              {opened.has(i) ? (
                <p className="letter-message">{letter.message}</p>
              ) : (
                <span className="envelope-label">
                  <Icon
                    icon={LETTER_ICONS[i % LETTER_ICONS.length]}
                    size={28}
                    className="envelope-icon"
                  />
                  {letter.label}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

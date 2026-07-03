import { useState } from "react";
import { Heart, ScrollText } from "lucide-react";
import { Icon } from "./Icon";
import { useContent } from "../context/ContentContext";

export default function LoveNoteJar() {
  const { loveNotes } = useContent();
  const [note, setNote] = useState(null);
  const [pulling, setPulling] = useState(false);

  const pullNote = () => {
    if (pulling) return;
    setPulling(true);
    setNote(null);

    setTimeout(() => {
      setNote(loveNotes[Math.floor(Math.random() * loveNotes.length)]);
      setPulling(false);
    }, 600);
  };

  return (
    <section className="section note-jar">
      <h2 className="section-title">
        <Icon icon={ScrollText} size={22} className="section-title-icon" />
        Jar of Love Notes
      </h2>
      <p className="section-sub">
        Pull out a note whenever your heart needs one
      </p>

      <div className={`jar ${pulling ? "shaking" : ""}`} onClick={pullNote}>
        <div className="jar-lid" />
        <div className="jar-body">
          <Icon icon={Heart} size={32} className="jar-label" />
        </div>
        <p className="jar-hint">tap the jar</p>
      </div>

      {note && (
        <div className="pulled-note">
          <p>"{note}"</p>
        </div>
      )}
    </section>
  );
}

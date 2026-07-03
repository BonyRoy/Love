import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import OurSongCard from "../components/OurSongCard";
import { Icon } from "../components/Icon";
import { useContent } from "../context/ContentContext";

function formatEventDate(value) {
  if (!value) return "";
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (iso) {
    const date = new Date(`${value}T12:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }
  return value;
}

export default function TimelinePage() {
  const { timeline, ourSong } = useContent();
  const [beatifyTrack, setBeatifyTrack] = useState(null);
  const [trackError, setTrackError] = useState(null);

  const beatifyUuid = ourSong.beatifyUuid?.trim();

  useEffect(() => {
    if (!beatifyUuid) {
      setBeatifyTrack(null);
      setTrackError(null);
      return;
    }

    let cancelled = false;

    import("../firebase/beatifyService")
      .then(({ fetchBeatifyTrack }) => fetchBeatifyTrack(beatifyUuid))
      .then((track) => {
        if (cancelled) return;
        setBeatifyTrack(track);
        setTrackError(track ? null : "Track not found in Beatify.");
      })
      .catch((err) => {
        if (cancelled) return;
        setBeatifyTrack(null);
        const message = err?.message?.includes("Firebase config")
          ? "Music config not loaded yet. Hard-refresh the page."
          : "Could not load track from Beatify.";
        setTrackError(message);
        console.error("Beatify track load failed:", err);
      });

    return () => {
      cancelled = true;
    };
  }, [beatifyUuid]);

  return (
    <div className="page">
      <div className="page-hero">
        <Icon icon={Clock} size={32} className="page-hero-icon" />
        <h1>Our Story</h1>
        <p>Every chapter of us — my favorite story ever written.</p>
      </div>

      <div className="timeline">
        {timeline.map((item, i) => (
          <div key={i} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-card">
              <span className="timeline-date">{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              {item.eventDate && (
                <p className="timeline-when">({formatEventDate(item.eventDate)})</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <OurSongCard
        ourSong={ourSong}
        beatifyTrack={beatifyTrack}
        trackError={trackError}
      />
    </div>
  );
}

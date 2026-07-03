import { useEffect, useState } from "react";
import { isVideoTrack } from "../utils/beatifyTrack";
import { resolveTrackBlob, revokePlaybackUrl } from "../utils/trackCache";
import { BEATIFY_URL } from "../utils/beatifyLaunch";

export default function OurSongPlayer({ track }) {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(Boolean(track?.fileUrl));

  const trackKey = `${track?.uuid || track?.id || ""}:${track?.fileUrl || ""}`;

  useEffect(() => {
    if (!track?.fileUrl) {
      setSrc(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    setLoading(true);

    resolveTrackBlob(track)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
        console.info("[Our Song] Playing from local blob", {
          uuid: track.uuid || track.id,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn("[Our Song] Playing from server stream (cache failed)", {
          url: track.fileUrl,
          error: err?.message,
        });
        setSrc(track.fileUrl);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      revokePlaybackUrl(objectUrl);
    };
  }, [trackKey]);

  if (!track?.fileUrl) return null;

  if (loading) {
    return <p className="song-loading">Loading song...</p>;
  }

  if (!src) return null;

  const credit = (
    <p className="song-player-credit">
      music by{" "}
      <a
        href={BEATIFY_URL}
        className="song-player-credit-brand"
        aria-label="Open Beatify"
      >
        Beatify
      </a>
    </p>
  );

  if (isVideoTrack(track)) {
    return (
      <>
        <video
          className="song-player"
          src={src}
          controls
          playsInline
          preload="metadata"
        />
        {credit}
      </>
    );
  }

  return (
    <>
      <audio className="song-player" src={src} controls preload="metadata" />
      {credit}
    </>
  );
}

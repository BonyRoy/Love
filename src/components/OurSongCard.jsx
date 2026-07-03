import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import { Icon } from "./Icon";
import OurSongPlayer from "./OurSongPlayer";
import {
  getBeatifyDisplayMeta,
  getStoredArtworkUrl,
  isMp3Track,
} from "../utils/beatifyTrack";
import { extractMp3Artwork } from "../utils/mp3Artwork";
import { resolveTrackBlob, revokePlaybackUrl } from "../utils/trackCache";

export default function OurSongCard({ ourSong, beatifyTrack, trackError }) {
  const [artworkUrl, setArtworkUrl] = useState(null);

  const meta = beatifyTrack
    ? getBeatifyDisplayMeta(beatifyTrack, ourSong)
    : {
        title: ourSong.title || "Your Song Here",
        artist: ourSong.artist || "Artist Name",
        album: "",
        genre: "",
      };

  useEffect(() => {
    if (!beatifyTrack || !isMp3Track(beatifyTrack) || !beatifyTrack.fileUrl) {
      setArtworkUrl(null);
      return;
    }

    let cancelled = false;
    const stored = getStoredArtworkUrl(beatifyTrack);

    if (stored) {
      setArtworkUrl(stored);
      return;
    }

    resolveTrackBlob(beatifyTrack)
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        return extractMp3Artwork(blobUrl).finally(() => revokePlaybackUrl(blobUrl));
      })
      .then((url) => {
        if (!cancelled) setArtworkUrl(url);
      });

    return () => {
      cancelled = true;
    };
  }, [beatifyTrack]);

  return (
    <div className="section song-card">
      <h3 className="song-heading">
        {ourSong.note?.trim() || "This song reminds me of you."}
      </h3>
      {artworkUrl ? (
        <img className="song-artwork" src={artworkUrl} alt={`${meta.title} cover`} />
      ) : (
        <Icon icon={Music} size={24} className="section-title-icon" />
      )}
      <p className="song-title">{meta.title}</p>
      <p className="song-artist">{meta.artist}</p>
      {meta.album && <p className="song-album">{meta.album}</p>}
      {beatifyTrack && <OurSongPlayer track={beatifyTrack} />}
      {trackError && <p className="song-error">{trackError}</p>}
    </div>
  );
}

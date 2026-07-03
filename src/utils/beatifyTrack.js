export function isMp3Track(track) {
  const hint = track?.originalFileName || track?.fileName || track?.fileUrl || "";
  return /\.mp3(\?|$)/i.test(hint);
}

export function isVideoTrack(track) {
  const hint = track?.originalFileName || track?.fileName || track?.fileUrl || "";
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(hint);
}

export function getStoredArtworkUrl(track) {
  return track?.artworkUrl || track?.coverUrl || track?.imageUrl || null;
}

export function getBeatifyDisplayMeta(track, overrides = {}) {
  return {
    title: track?.name || overrides.title || "Your Song Here",
    artist: track?.artist || overrides.artist || "Artist Name",
    album: track?.album || "",
    genre: track?.genre || "",
  };
}

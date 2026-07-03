import { useEffect, useState } from "react";
import { ExternalLink, MapPin, X } from "lucide-react";
import { Icon } from "./Icon";
import {
  hasMessageLocation,
  mapEmbedUrl,
  mapsUrl,
  reverseGeocode,
} from "../utils/geolocation";

function formatTime(iso) {
  return new Date(iso).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function ChatLocationModal({
  message,
  senderLabel,
  onClose,
}) {
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const located = hasMessageLocation(message);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!located) return;
    let active = true;
    setLoadingAddress(true);
    reverseGeocode(message.latitude, message.longitude)
      .then((name) => {
        if (active) setAddress(name ?? "");
      })
      .catch(() => {
        if (active) setAddress("");
      })
      .finally(() => {
        if (active) setLoadingAddress(false);
      });
    return () => {
      active = false;
    };
  }, [located, message.latitude, message.longitude]);

  const preview = message.body
    ? message.body
    : message.image_url
      ? "Photo message"
      : "Message";

  return (
    <div className="chat-location-modal" role="dialog" aria-modal="true" aria-label="Message location">
      <button
        type="button"
        className="chat-menu-backdrop"
        aria-label="Close location"
        onClick={onClose}
      />
      <div className="chat-location-card">
        <div className="chat-location-header">
          <div>
            <p className="chat-location-label">Sent from</p>
            <h2>{senderLabel}</h2>
          </div>
          <button type="button" className="chat-location-close" onClick={onClose} aria-label="Close">
            <Icon icon={X} size={22} />
          </button>
        </div>

        <p className="chat-location-preview">"{preview}"</p>
        <p className="chat-location-time">{formatTime(message.created_at)}</p>

        {located ? (
          <>
            {address && <p className="chat-location-address">{address}</p>}
            {loadingAddress && !address && (
              <p className="chat-location-address loading">Looking up address...</p>
            )}
            <p className="chat-location-coords">
              {Number(message.latitude).toFixed(5)}, {Number(message.longitude).toFixed(5)}
              {message.location_accuracy != null && (
                <span> · ±{Math.round(message.location_accuracy)}m</span>
              )}
            </p>
            <div className="chat-location-map">
              <iframe
                title="Message location map"
                src={mapEmbedUrl(message.latitude, message.longitude)}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              href={mapsUrl(message.latitude, message.longitude)}
              target="_blank"
              rel="noreferrer"
              className="chat-location-open-btn"
            >
              <Icon icon={ExternalLink} size={18} />
              Open in Google Maps
            </a>
          </>
        ) : (
          <div className="chat-location-missing">
            <Icon icon={MapPin} size={28} />
            <p>Location was not captured for this message.</p>
            <span>Permission may have been denied, or the message was sent before location tracking was enabled.</span>
          </div>
        )}
      </div>
    </div>
  );
}

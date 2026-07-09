import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { Icon } from "./Icon";

function imageFilename(url) {
  try {
    const path = new URL(url).pathname;
    const base = path.split("/").pop();
    if (base && base.includes(".")) return decodeURIComponent(base);
  } catch {
    // blob: or invalid URL
  }
  return `chat-photo-${Date.now()}.jpg`;
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.click();
  }
}

export default function ChatImagePreview({
  imageUrl,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) {
  const [downloading, setDownloading] = useState(false);
  const filename = imageFilename(imageUrl);
  const showNavigation = Boolean(onPrevious || onNext);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "ArrowLeft" && hasPrevious && onPrevious) {
        e.preventDefault();
        onPrevious();
        return;
      }

      if (e.key === "ArrowRight" && hasNext && onNext) {
        e.preventDefault();
        onNext();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, onPrevious, onNext, hasPrevious, hasNext]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImage(imageUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return createPortal(
    <div
      className="chat-image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <button
        type="button"
        className="chat-image-preview-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Close preview"
      >
        <Icon icon={X} size={24} />
      </button>

      {showNavigation && (
        <>
          <button
            type="button"
            className="chat-image-preview-nav chat-image-preview-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious?.();
            }}
            disabled={!hasPrevious}
            aria-label="Previous photo"
          >
            <Icon icon={ChevronLeft} size={28} />
          </button>
          <button
            type="button"
            className="chat-image-preview-nav chat-image-preview-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext?.();
            }}
            disabled={!hasNext}
            aria-label="Next photo"
          >
            <Icon icon={ChevronRight} size={28} />
          </button>
        </>
      )}

      <div className="chat-image-preview-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="chat-image-preview-btn chat-image-preview-download"
          onClick={handleDownload}
          disabled={downloading}
          aria-label="Download image"
        >
          <Icon icon={Download} size={20} />
          <span>{downloading ? "Saving..." : "Download"}</span>
        </button>
      </div>
      <div className="chat-image-preview-body" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl} alt="Image preview" className="chat-image-preview-img" />
      </div>
    </div>,
    document.body,
  );
}

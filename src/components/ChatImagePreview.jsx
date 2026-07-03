import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
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

export default function ChatImagePreview({ imageUrl, onClose }) {
  const [downloading, setDownloading] = useState(false);
  const filename = imageFilename(imageUrl);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadImage(imageUrl, filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div
      className="chat-image-preview"
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
    >
      <div className="chat-image-preview-toolbar" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="chat-image-preview-btn"
          onClick={onClose}
          aria-label="Close preview"
        >
          <Icon icon={X} size={22} />
        </button>
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
        <img src={imageUrl} alt="Chat attachment preview" className="chat-image-preview-img" />
      </div>
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Images, RefreshCw } from "lucide-react";
import ChatImagePreview from "../components/ChatImagePreview";
import { Icon } from "../components/Icon";
import { getPhotosRuntime } from "../config/photosRuntime";
import { fetchPhotosList } from "../utils/googleDrive";

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [driveFolderUrl, setDriveFolderUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [previewIndex, setPreviewIndex] = useState(null);

  const loadPhotos = useCallback(async ({ background = false } = {}) => {
    if (background) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const images = await fetchPhotosList();
      setPhotos(images);
    } catch (err) {
      setPhotos([]);
      setError(err.message ?? "Failed to load photos.");
    } finally {
      if (background) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    getPhotosRuntime()
      .then((config) => setDriveFolderUrl(config.driveFolderUrl))
      .catch(() => {
        // Drive link is optional — photos still load from /api/photos-manifest
      });
  }, []);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadPhotos({ background: true });
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [loadPhotos]);

  const needsSetup = !loading && photos.length === 0;

  return (
    <div className="page photos-page">
      <div className="page-hero">
        <Icon icon={Images} size={32} className="page-hero-icon" />
        <h1>Our Photos</h1>
        <p>Every little memory, kept in one place.</p>
        <div className="photos-hero-actions">
          {driveFolderUrl && (
            <a
              href={driveFolderUrl}
              target="_blank"
              rel="noreferrer"
              className="photos-drive-link"
            >
              <Icon icon={ExternalLink} size={16} />
              Open in Google Drive
            </a>
          )}
          <button
            type="button"
            className="photos-refresh-btn"
            onClick={() => loadPhotos({ background: true })}
            disabled={loading || refreshing}
            aria-label="Refresh photos from Google Drive"
          >
            <Icon icon={RefreshCw} size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="photos-status" aria-live="polite">
          Loading photos from Google Drive...
        </div>
      )}

      {error && (
        <p className="photos-error" role="alert">
          {error}
        </p>
      )}

      {!loading && photos.length > 0 && (
        <div className="photos-grid" aria-label="Photo gallery">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              className="photos-grid-item"
              style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
              onClick={() => setPreviewIndex(index)}
              aria-label={`View ${photo.name}`}
            >
              <img src={photo.thumbnailUrl} alt={photo.name} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {needsSetup && (
        <div className="photos-setup">
          <p>No photos loaded yet.</p>
          <ol className="photos-setup-steps">
            <li>
              Add images to your{" "}
              {driveFolderUrl ? (
                <a href={driveFolderUrl} target="_blank" rel="noreferrer">
                  Google Drive folder
                </a>
              ) : (
                "Google Drive folder"
              )}
            </li>
            <li>Make sure the folder is shared as &quot;Anyone with the link&quot;</li>
            <li>Click Refresh — new photos appear automatically</li>
          </ol>
        </div>
      )}

      {previewIndex !== null && photos[previewIndex] && (
        <ChatImagePreview
          imageUrl={photos[previewIndex].viewUrl}
          onClose={() => setPreviewIndex(null)}
          onPrevious={() => setPreviewIndex((index) => Math.max(0, index - 1))}
          onNext={() =>
            setPreviewIndex((index) => Math.min(photos.length - 1, index + 1))
          }
          hasPrevious={previewIndex > 0}
          hasNext={previewIndex < photos.length - 1}
        />
      )}
    </div>
  );
}

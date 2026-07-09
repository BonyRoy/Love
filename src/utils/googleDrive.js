import { PHOTOS_MANIFEST_API } from "../config/photos";

const IMAGE_EXT = /\.(heic|heif|jpe?g|png|gif|webp|avif|bmp)$/i;

export function getDriveThumbnailUrl(fileId, width = 480) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
}

function isHeicLike(mimeType, name) {
  if (mimeType?.includes("heif") || mimeType?.includes("heic")) return true;
  return /\.heic$/i.test(name ?? "");
}

export function getDriveViewUrl(fileId, mimeType, name) {
  if (isHeicLike(mimeType, name)) {
    return getDriveThumbnailUrl(fileId, 2400);
  }
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

function isImageFile(file) {
  if (file.mimeType?.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name ?? "");
}

export function buildPhotoList(files) {
  return files
    .filter(isImageFile)
    .map((file) => ({
      id: file.id,
      name: file.name,
      thumbnailUrl: getDriveThumbnailUrl(file.id, 480),
      viewUrl: getDriveViewUrl(file.id, file.mimeType, file.name),
      modifiedTime: file.modifiedTime,
    }))
    .sort((a, b) => {
      if (!a.modifiedTime || !b.modifiedTime) return 0;
      return new Date(b.modifiedTime) - new Date(a.modifiedTime);
    });
}

export async function fetchPhotosList() {
  const response = await fetch(PHOTOS_MANIFEST_API, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load photos from Google Drive.");
  }

  const files = await response.json();
  if (!Array.isArray(files)) {
    throw new Error("Photo list was invalid.");
  }

  return buildPhotoList(files);
}

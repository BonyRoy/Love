import { loadPhotosRuntime } from "./load-runtime-config.mjs";

const IMAGE_EXT = /\.(heic|heif|jpe?g|png|gif|webp|avif|bmp)$/i;
const DRIVE_FILE_ID_RE = /"1[A-Za-z0-9_-]{30,44}"/g;
const IMAGE_NAME_RE =
  /[A-Za-z0-9_.-]+\.(?:heic|heif|jpe?g|png|gif|webp|avif|bmp)/gi;

function isImageFile(file) {
  if (file.mimeType?.startsWith("image/")) return true;
  return IMAGE_EXT.test(file.name ?? "");
}

function normalizePhotos(files) {
  return files
    .filter(isImageFile)
    .map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType ?? guessMimeType(file.name),
      modifiedTime: file.modifiedTime ?? null,
    }))
    .sort((a, b) => {
      if (!a.modifiedTime || !b.modifiedTime) return 0;
      return new Date(b.modifiedTime) - new Date(a.modifiedTime);
    });
}

function guessMimeType(name) {
  if (/\.heic$/i.test(name)) return "image/heic";
  if (/\.heif$/i.test(name)) return "image/heif";
  if (/\.jpe?g$/i.test(name)) return "image/jpeg";
  if (/\.png$/i.test(name)) return "image/png";
  if (/\.gif$/i.test(name)) return "image/gif";
  if (/\.webp$/i.test(name)) return "image/webp";
  return "application/octet-stream";
}

async function listFromAppsScript(manifestUrl) {
  if (!manifestUrl) return null;

  const response = await fetch(manifestUrl, { redirect: "follow" });
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json") && !contentType.includes("javascript")) {
    return null;
  }

  const data = await response.json();
  return Array.isArray(data) && data.length ? normalizePhotos(data) : null;
}

async function listFromDriveApi(folderId, apiKey) {
  if (!apiKey) return null;

  const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime)");
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${query}` +
    `&fields=${fields}&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true&key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) return null;

  const data = await response.json();
  if (!Array.isArray(data.files) || !data.files.length) return null;
  return normalizePhotos(data.files);
}

function extractIdBeforeName(html, nameIndex) {
  const chunk = html.slice(Math.max(0, nameIndex - 700), nameIndex);
  const ids = chunk.match(DRIVE_FILE_ID_RE);
  if (!ids?.length) return null;
  return ids.at(-1).slice(1, -1);
}

async function listFromPublicFolderHtml(folderId) {
  const response = await fetch(`https://drive.google.com/drive/folders/${folderId}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; IshuPhotosBot/1.0; +https://beatify-2.vercel.app)",
    },
  });
  if (!response.ok) return null;

  const html = await response.text();
  const photos = [];
  const seen = new Set();

  for (const match of html.matchAll(IMAGE_NAME_RE)) {
    const name = match[0];
    const id = extractIdBeforeName(html, match.index ?? 0);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    photos.push({
      id,
      name,
      mimeType: guessMimeType(name),
      modifiedTime: null,
    });
  }

  return photos.length ? photos : null;
}

export async function getDrivePhotosManifest() {
  const photosConfig = await loadPhotosRuntime();

  const sources = [
    () => listFromAppsScript(photosConfig.driveManifestUrl),
    () => listFromDriveApi(photosConfig.driveFolderId, photosConfig.googleDriveApiKey),
    () => listFromPublicFolderHtml(photosConfig.driveFolderId),
  ];

  for (const source of sources) {
    try {
      const photos = await source();
      if (photos?.length) return photos;
    } catch {
      // try next source
    }
  }

  throw new Error("Could not load photos from Google Drive.");
}

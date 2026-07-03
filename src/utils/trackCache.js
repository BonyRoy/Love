const DB_NAME = "ishu-beatify-cache";
const STORE_NAME = "tracks";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "uuid" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function withStore(mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);

        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };

        fn(store, resolve, reject, tx);
      }),
  );
}

function getMimeType(remoteUrl, responseType) {
  if (responseType) return responseType;
  const path = remoteUrl.split("?")[0].toLowerCase();
  if (path.endsWith(".mp4")) return "video/mp4";
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".m4a")) return "audio/mp4";
  return "audio/mpeg";
}

function getTrackUuid(track) {
  return track?.uuid?.trim() || track?.id || "";
}

async function readEntry(uuid) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(uuid);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function clearAllEntries() {
  await withStore("readwrite", (store) => {
    store.clear();
  });
}

async function writeEntry(entry) {
  await withStore("readwrite", (store) => {
    store.put(entry);
  });
}

export async function getCachedTrackBlob(track) {
  const uuid = getTrackUuid(track);
  const remoteUrl = track?.fileUrl;
  if (!uuid || !remoteUrl) return null;

  const entry = await readEntry(uuid);
  if (!entry?.blob) return null;
  if (entry.remoteUrl !== remoteUrl) {
    await clearAllEntries();
    return null;
  }

  return entry.blob;
}

function normalizeBlob(blob, remoteUrl, responseType) {
  const mimeType = getMimeType(remoteUrl, responseType);
  if (blob.type && blob.type !== "application/octet-stream") return blob;
  return new Blob([blob], { type: mimeType });
}

function toProxiedUrl(remoteUrl) {
  try {
    const parsed = new URL(remoteUrl);
    if (parsed.hostname !== "firebasestorage.googleapis.com") return remoteUrl;
    return `/api/beatify-proxy${parsed.pathname}${parsed.search}`;
  } catch {
    return remoteUrl;
  }
}

async function downloadBlob(track) {
  const remoteUrl = track.fileUrl;
  const proxiedUrl = toProxiedUrl(remoteUrl);

  const response = await fetch(proxiedUrl);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const viaProxy = proxiedUrl !== remoteUrl;
  console.info(
    viaProxy
      ? "[Our Song] Downloaded via same-origin proxy (for IndexedDB cache)"
      : "[Our Song] Downloaded via direct fetch",
    { proxiedUrl },
  );
  return normalizeBlob(blob, remoteUrl, blob.type || response.headers.get("Content-Type"));
}

async function downloadAndStore(track) {
  const uuid = getTrackUuid(track);
  const remoteUrl = track.fileUrl;

  const normalized = await downloadBlob(track);
  const mimeType = normalized.type || getMimeType(remoteUrl, null);

  await clearAllEntries();
  await writeEntry({
    uuid,
    remoteUrl,
    mimeType,
    blob: normalized,
    cachedAt: Date.now(),
  });

  return normalized;
}

const inflight = new Map();

export async function resolveTrackBlob(track) {
  const uuid = getTrackUuid(track);
  const remoteUrl = track?.fileUrl;
  if (!uuid || !remoteUrl) {
    throw new Error("Track is missing uuid or fileUrl.");
  }

  const cached = await getCachedTrackBlob(track);
  if (cached) {
    console.info("[Our Song] Playing from IndexedDB cache", { uuid });
    return cached;
  }

  const key = `${uuid}:${remoteUrl}`;
  if (inflight.has(key)) {
    console.info("[Our Song] Reusing in-progress download", { uuid });
    return inflight.get(key);
  }

  console.info("[Our Song] Downloading from server", { uuid, remoteUrl });

  const promise = downloadAndStore(track)
    .then((blob) => {
      console.info("[Our Song] Saved to IndexedDB cache", { uuid });
      return blob;
    })
    .finally(() => {
      inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

export function revokePlaybackUrl(url) {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

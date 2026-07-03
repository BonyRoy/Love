const JPEG_QUALITY = 0.97;

const HIGH_RES_VIDEO = {
  width: { ideal: 4096, min: 1280 },
  height: { ideal: 4096, min: 720 },
  frameRate: { ideal: 30, max: 30 },
};

function hasCameraApi() {
  return Boolean(
    typeof navigator !== "undefined" &&
      navigator.mediaDevices?.getUserMedia,
  );
}

async function tryGetUserMedia(constraints) {
  return navigator.mediaDevices.getUserMedia(constraints);
}

function facingFromTrack(stream) {
  const track = stream.getVideoTracks()[0];
  const facing = track?.getSettings?.().facingMode;
  return facing === "user" ? "user" : "environment";
}

async function maximizeTrackResolution(stream) {
  const track = stream.getVideoTracks()[0];
  if (!track?.applyConstraints) return;

  const caps = track.getCapabilities?.();
  if (!caps) return;

  const width = caps.width?.max;
  const height = caps.height?.max;
  if (!width || !height) return;

  const advanced = [];
  if (Array.isArray(caps.resizeMode) && caps.resizeMode.includes("none")) {
    advanced.push({ resizeMode: "none" });
  }

  try {
    await track.applyConstraints({
      width: { ideal: width },
      height: { ideal: height },
      ...(advanced.length ? { advanced } : {}),
    });
  } catch {
    try {
      await track.applyConstraints({
        width: { ideal: width },
        height: { ideal: height },
      });
    } catch {
      // keep stream defaults
    }
  }
}

function buildVideoConstraints(extra = {}) {
  return {
    ...HIGH_RES_VIDEO,
    ...extra,
  };
}

async function tryFacingMode(mode) {
  const stream = await tryGetUserMedia({
    video: buildVideoConstraints({ facingMode: mode }),
    audio: false,
  });
  await maximizeTrackResolution(stream);
  return { stream, facingMode: facingFromTrack(stream) };
}

async function tryDeviceId(deviceId, facingMode) {
  const stream = await tryGetUserMedia({
    video: buildVideoConstraints({ deviceId: { exact: deviceId } }),
    audio: false,
  });
  await maximizeTrackResolution(stream);
  return { stream, facingMode };
}

async function pickCameraByDeviceId(preferBack) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((d) => d.kind === "videoinput");
  if (!cameras.length) return null;

  const back = cameras.find((d) =>
    /back|rear|environment|trás|arrière/i.test(d.label),
  );
  const front = cameras.find((d) =>
    /front|user|face|selfie|avant/i.test(d.label),
  );

  const primary = preferBack ? back : front;
  const fallback = preferBack ? front : back;
  const chosen = primary ?? fallback ?? cameras[0];
  if (!chosen?.deviceId) return null;

  const facingMode =
    chosen === back ? "environment" : chosen === front ? "user" : "environment";

  return tryDeviceId(chosen.deviceId, facingMode);
}

/**
 * Prefer rear camera; fall back to front, then any available camera.
 */
export async function getPreferredCameraStream() {
  if (!hasCameraApi()) {
    throw new Error("Camera API unavailable. Use HTTPS.");
  }

  const attempts = [
    () => tryFacingMode({ exact: "environment" }),
    () => tryFacingMode({ ideal: "environment" }),
    () => pickCameraByDeviceId(true),
    () => tryFacingMode({ ideal: "user" }),
    () => pickCameraByDeviceId(false),
    async () => {
      const stream = await tryGetUserMedia({
        video: buildVideoConstraints(),
        audio: false,
      });
      await maximizeTrackResolution(stream);
      return { stream, facingMode: facingFromTrack(stream) };
    },
  ];

  let lastError;
  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result?.stream) return result;
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError ?? new Error("No camera available");
}

export function stopCameraStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

export async function attachStreamToVideo(video, stream) {
  if (!video || !stream) return;

  video.srcObject = stream;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.muted = true;

  await new Promise((resolve) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve();
      return;
    }
    video.onloadedmetadata = () => resolve();
  });

  await video.play();
}

async function blobFromCanvas(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", JPEG_QUALITY);
  });
}

async function processCapturedBlob(blob, { zoom = 1, mirror = false } = {}) {
  if (zoom <= 1 && !mirror) return blob;

  const bitmap = await createImageBitmap(blob);
  try {
    const sourceWidth = bitmap.width;
    const sourceHeight = bitmap.height;

    const cropWidth = zoom > 1 ? sourceWidth / zoom : sourceWidth;
    const cropHeight = zoom > 1 ? sourceHeight / zoom : sourceHeight;
    const cropX = (sourceWidth - cropWidth) / 2;
    const cropY = (sourceHeight - cropHeight) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process photo.");

    if (mirror) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(
      bitmap,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    return blobFromCanvas(canvas);
  } finally {
    bitmap.close();
  }
}

async function captureWithImageCapture(track) {
  if (typeof ImageCapture === "undefined") return null;

  try {
    const imageCapture = new ImageCapture(track);
    const capabilities = await imageCapture.getPhotoCapabilities?.();
    const settings = {};

    if (capabilities?.imageWidth?.max) {
      settings.imageWidth = capabilities.imageWidth.max;
    }
    if (capabilities?.imageHeight?.max) {
      settings.imageHeight = capabilities.imageHeight.max;
    }

    return await imageCapture.takePhoto(
      Object.keys(settings).length ? settings : undefined,
    );
  } catch {
    return null;
  }
}

async function captureFromVideoElement(video) {
  const sourceWidth = video.videoWidth || 1280;
  const sourceHeight = video.videoHeight || 720;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(sourceWidth);
  canvas.height = Math.round(sourceHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not capture photo.");

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  return blobFromCanvas(canvas);
}

/**
 * Capture at the highest quality available, with optional zoom crop and mirror.
 */
export async function captureHighQualityPhoto(
  stream,
  video,
  { zoom = 1, mirror = false } = {},
) {
  const track = stream?.getVideoTracks?.()[0];
  let blob = track ? await captureWithImageCapture(track) : null;

  if (!blob) {
    if (!video) throw new Error("Camera preview unavailable.");
    blob = await captureFromVideoElement(video);
  }

  return processCapturedBlob(blob, { zoom, mirror });
}

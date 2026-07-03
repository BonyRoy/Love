export const BEATIFY_URL = "https://beatify-2.vercel.app/";

export function isBeatifyUrl(url) {
  try {
    const host = new URL(url).hostname;
    return host === "beatify-2.vercel.app" || host.endsWith(".beatify-2.vercel.app");
  } catch {
    return false;
  }
}

export function isIosDevice() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroidDevice() {
  return /Android/i.test(navigator.userAgent);
}

const READ_KEY = "ishu-chat-last-read";

export function getLastRead(viewer) {
  try {
    const data = JSON.parse(localStorage.getItem(READ_KEY) || "{}");
    if (data[viewer]) return data[viewer];
  } catch {
    // ignore
  }
  return new Date(0).toISOString();
}

export function markChatRead(viewer) {
  try {
    const data = JSON.parse(localStorage.getItem(READ_KEY) || "{}");
    data[viewer] = new Date().toISOString();
    localStorage.setItem(READ_KEY, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent("ishu-chat-read", { detail: { viewer } }));
  } catch {
    // ignore
  }
}

export function partnerSender(viewer) {
  return viewer === "her" ? "admin" : "her";
}

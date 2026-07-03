export function encodePayload(value) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function decodePayload(encoded) {
  if (!encoded) return "";
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function decodePayloadJson(encoded) {
  const raw = decodePayload(encoded);
  if (!raw) return null;
  return JSON.parse(raw);
}

export function encodeEnvelope(payload) {
  return encodePayload(payload);
}

export function decodeEnvelope(encoded) {
  const raw = decodePayload(encoded);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

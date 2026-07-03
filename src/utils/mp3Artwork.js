function syncsafeToInt(b0, b1, b2, b3) {
  return ((b0 & 0x7f) << 21) | ((b1 & 0x7f) << 14) | ((b2 & 0x7f) << 7) | (b3 & 0x7f);
}

function readUInt32BE(bytes, offset) {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function frameId(bytes, offset) {
  return String.fromCharCode(
    bytes[offset],
    bytes[offset + 1],
    bytes[offset + 2],
    bytes[offset + 3],
  );
}

function skipNullTerminated(bytes, start, encoding) {
  let i = start;
  if (encoding === 1 || encoding === 2) {
    while (i + 1 < bytes.length && !(bytes[i] === 0 && bytes[i + 1] === 0)) i += 2;
    return i + 2;
  }
  while (i < bytes.length && bytes[i] !== 0) i++;
  return i + 1;
}

function parseApicFrame(bytes, start, end) {
  if (start >= end) return null;

  const encoding = bytes[start];
  let i = start + 1;

  let mime = "";
  while (i < end && bytes[i] !== 0) {
    mime += String.fromCharCode(bytes[i]);
    i++;
  }
  i++;

  if (i >= end) return null;
  i++;

  i = skipNullTerminated(bytes, i, encoding);
  if (i >= end) return null;

  const imageBytes = bytes.subarray(i, end);
  if (!imageBytes.length) return null;

  const type = mime || "image/jpeg";
  const binary = Array.from(imageBytes, (b) => String.fromCharCode(b)).join("");
  return `data:${type};base64,${btoa(binary)}`;
}

function parseId3Artwork(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return null;
  if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;

  const versionMajor = bytes[3];
  const tagSize = syncsafeToInt(bytes[6], bytes[7], bytes[8], bytes[9]);
  let offset = 10;
  const tagEnd = Math.min(10 + tagSize, bytes.length);

  while (offset + 10 <= tagEnd) {
    const id = frameId(bytes, offset);
    if (!id.trim() || id === "\0\0\0\0") break;

    let frameSize;
    let headerSize;
    if (versionMajor === 4) {
      frameSize = syncsafeToInt(
        bytes[offset + 4],
        bytes[offset + 5],
        bytes[offset + 6],
        bytes[offset + 7],
      );
      headerSize = 10;
    } else {
      frameSize = readUInt32BE(bytes, offset + 4);
      headerSize = 10;
    }

    const frameStart = offset + headerSize;
    const frameEnd = frameStart + frameSize;
    if (frameEnd > bytes.length) break;

    if (id === "APIC" || id === "PIC") {
      const artwork = parseApicFrame(bytes, frameStart, frameEnd);
      if (artwork) return artwork;
    }

    offset = frameEnd;
  }

  return null;
}

async function fetchMp3Header(fileUrl) {
  const rangeResponse = await fetch(fileUrl, {
    headers: { Range: "bytes=0-524287" },
  });

  if (rangeResponse.ok || rangeResponse.status === 206) {
    return rangeResponse.arrayBuffer();
  }

  const fullResponse = await fetch(fileUrl);
  if (!fullResponse.ok) return null;
  return fullResponse.arrayBuffer();
}

export async function extractMp3Artwork(fileUrl) {
  try {
    const buffer = await fetchMp3Header(fileUrl);
    if (!buffer) return null;
    return parseId3Artwork(buffer);
  } catch {
    return null;
  }
}

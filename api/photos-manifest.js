import { getDrivePhotosManifest } from "../lib/drive-photos-manifest.mjs";

export default async function handler(_req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  try {
    const photos = await getDrivePhotosManifest();
    res.status(200).json(photos);
  } catch (error) {
    res.status(502).json({
      error: error?.message ?? "Could not load photos from Google Drive.",
    });
  }
}

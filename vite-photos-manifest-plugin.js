import { getDrivePhotosManifest } from "./lib/drive-photos-manifest.mjs";
import { sendJson } from "./lib/photos-api-utils.mjs";

function attachPhotosRoutes(server) {
  server.middlewares.use("/api/photos-manifest", async (_req, res) => {
    try {
      const photos = await getDrivePhotosManifest();
      sendJson(res, 200, photos);
    } catch (error) {
      sendJson(res, 502, {
        error: error?.message ?? "Could not load photos from Google Drive.",
      });
    }
  });
}

export function photosManifestPlugin() {
  return {
    name: "photos-manifest",
    configureServer(server) {
      attachPhotosRoutes(server);
    },
    configurePreviewServer(server) {
      attachPhotosRoutes(server);
    },
  };
}

import { clearRuntimeConfigCache, loadRuntimeConfig } from "../supabase/bootstrap";
import { parsePhotosRuntime } from "../../lib/photos-runtime.mjs";

let cache = null;

export async function getPhotosRuntime() {
  if (cache) return cache;

  let runtime = await loadRuntimeConfig();
  let photos = parsePhotosRuntime(runtime);

  if (!photos) {
    clearRuntimeConfigCache();
    clearPhotosRuntimeCache();
    runtime = await loadRuntimeConfig();
    photos = parsePhotosRuntime(runtime);
  }

  if (!photos) {
    throw new Error("Photos config is missing in Supabase runtime.");
  }

  cache = photos;
  return photos;
}

export function clearPhotosRuntimeCache() {
  cache = null;
}

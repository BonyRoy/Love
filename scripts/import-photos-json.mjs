#!/usr/bin/env node
/**
 * Optional snapshot of the live Drive manifest into public/photos.json
 *
 *   npm run import-photos
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getDrivePhotosManifest } from "../lib/drive-photos-manifest.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "../public/photos.json");

const photos = await getDrivePhotosManifest();
writeFileSync(OUTPUT, `${JSON.stringify(photos, null, 2)}\n`);
console.log(`Saved ${photos.length} photo(s) to public/photos.json`);

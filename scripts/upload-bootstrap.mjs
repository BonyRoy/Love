import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(root, "supabase", "bootstrap-runtime.json");

const config = JSON.parse(readFileSync(configPath, "utf8"));
const { supabase_url, supabase_anon_key } = config;

if (!supabase_url || !supabase_anon_key) {
  console.error("Missing supabase_url or supabase_anon_key in bootstrap-runtime.json");
  process.exit(1);
}

const placeholders = [
  ["supabase_url", /YOUR_PROJECT_REF|your_project_ref/i],
  ["supabase_anon_key", /your_anon_key/i],
  ["firebase.api_key", /your_firebase_api_key/i],
];

for (const [label, pattern] of placeholders) {
  const value =
    label === "firebase.api_key" ? config.firebase?.api_key : config[label.split(".")[0]];
  if (typeof value === "string" && pattern.test(value)) {
    console.error(
      `bootstrap-runtime.json still has placeholder values (${label}).\n` +
        "Edit supabase/bootstrap-runtime.json with your real Supabase + Firebase keys, then retry.",
    );
    process.exit(1);
  }
}

if (!config.firebase?.api_key) {
  console.warn("Warning: firebase block missing in bootstrap-runtime.json (Our Song needs it).");
}

if (!config.photos?.drive_folder_id) {
  console.warn("Warning: photos block missing in bootstrap-runtime.json (Our Photos needs it).");
}

const uploadUrl = `${supabase_url}/storage/v1/object/app-bootstrap/runtime.json`;

const res = await fetch(uploadUrl, {
  method: "POST",
  headers: {
    apikey: supabase_anon_key,
    Authorization: `Bearer ${supabase_anon_key}`,
    "Content-Type": "application/json",
    "x-upsert": "true",
  },
  body: JSON.stringify(config, null, 2),
});

const text = await res.text();
if (!res.ok) {
  console.error("Upload failed:", res.status, text);
  process.exit(1);
}

console.log("Uploaded runtime.json to app-bootstrap bucket.");
console.log("Public URL:", `${supabase_url}/storage/v1/object/public/app-bootstrap/runtime.json`);

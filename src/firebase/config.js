import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { clearRuntimeConfigCache, loadRuntimeConfig } from "../supabase/bootstrap";

let beatifyApp = null;
let beatifyDb = null;
let beatifyStorage = null;

function buildFirebaseConfig(runtime) {
  const fb = runtime?.firebase;
  if (!fb?.api_key || !fb?.project_id || !fb?.app_id) return null;

  return {
    apiKey: fb.api_key,
    authDomain: fb.auth_domain,
    projectId: fb.project_id,
    storageBucket: fb.storage_bucket,
    messagingSenderId: fb.messaging_sender_id,
    appId: fb.app_id,
  };
}

export async function initFirebase() {
  if (beatifyDb) return beatifyDb;

  let runtime = await loadRuntimeConfig();
  let firebaseConfig = buildFirebaseConfig(runtime);

  if (!firebaseConfig) {
    clearRuntimeConfigCache();
    runtime = await loadRuntimeConfig();
    firebaseConfig = buildFirebaseConfig(runtime);
  }

  if (!firebaseConfig) {
    throw new Error(
      "Firebase config not found. Run npm run upload-bootstrap, then hard-refresh.",
    );
  }

  beatifyApp = initializeApp(firebaseConfig, "beatify");
  beatifyDb = getFirestore(beatifyApp);
  beatifyStorage = getStorage(beatifyApp);
  return beatifyDb;
}

export async function getBeatifyApp() {
  await initFirebase();
  return beatifyApp;
}

export async function getBeatifyStorage() {
  await initFirebase();
  return beatifyStorage;
}

export async function getBeatifyDb() {
  return initFirebase();
}

export function isFirebaseConfigured() {
  return beatifyDb !== null;
}

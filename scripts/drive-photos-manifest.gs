/**
 * Google Apps Script — deploy once, then set drive_manifest_url in Supabase:
 *   supabase/photos-runtime.sql → app_runtime_config.photos.drive_manifest_url
 *
 * Deploy: Extensions → Apps Script → paste this file → Deploy → New deployment
 * Type: Web app | Execute as: Me | Who has access: Anyone
 *
 * Script property (Project Settings → Script properties):
 *   PHOTOS_WRITE_SECRET = same value as PHOTOS_APPS_SCRIPT_SECRET in Vercel
 *
 * After code changes, create a NEW deployment version (not just Save).
 */
const FOLDER_ID = "1WbfUf1VukZwdczyghwAeEuNsgIjHyHU9";
const WRITE_SECRET_KEY = "PHOTOS_WRITE_SECRET";

function listPhotos_() {
  const folder = DriveApp.getFolderById(FOLDER_ID);
  const files = folder.getFiles();
  const photos = [];

  while (files.hasNext()) {
    const file = files.next();
    const name = file.getName();
    const mimeType = file.getMimeType();
    if (!mimeType.startsWith("image/") && !/\.heic$/i.test(name)) continue;

    photos.push({
      id: file.getId(),
      name,
      mimeType,
      modifiedTime: file.getLastUpdated().toISOString(),
    });
  }

  photos.sort((a, b) => new Date(b.modifiedTime) - new Date(a.modifiedTime));
  return photos;
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function unauthorized_() {
  return jsonResponse_({ error: "Unauthorized" });
}

function validateSecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty(WRITE_SECRET_KEY);
  return expected && secret === expected;
}

function doGet(e) {
  const photos = listPhotos_();
  const json = JSON.stringify(photos);
  const callback = e?.parameter?.callback;

  if (callback) {
    return ContentService.createTextOutput(`${callback}(${json})`).setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }

  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  if (!validateSecret_(body.secret)) return unauthorized_();

  if (body.action === "upload") {
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const blob = Utilities.newBlob(
      Utilities.base64Decode(body.data),
      body.mimeType,
      body.name,
    );
    const file = folder.createFile(blob);
    return jsonResponse_({
      id: file.getId(),
      name: file.getName(),
      mimeType: file.getMimeType(),
      modifiedTime: file.getLastUpdated().toISOString(),
    });
  }

  if (body.action === "delete") {
    DriveApp.getFileById(body.fileId).setTrashed(true);
    return jsonResponse_({ ok: true });
  }

  return jsonResponse_({ error: "Unknown action" });
}

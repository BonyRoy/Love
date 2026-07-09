export function parsePhotosRuntime(runtime) {
  const photos = runtime?.photos;
  if (!photos?.drive_folder_id) return null;

  const folderId = photos.drive_folder_id;

  return {
    driveFolderId: folderId,
    driveFolderUrl: `https://drive.google.com/drive/folders/${folderId}`,
    driveManifestUrl: photos.drive_manifest_url ?? "",
    googleDriveApiKey: photos.google_drive_api_key ?? "",
    googleClientId: photos.google_client_id ?? "",
  };
}

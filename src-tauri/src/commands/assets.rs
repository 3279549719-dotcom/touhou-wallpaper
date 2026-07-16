use crate::models::types::{Manifest, MIN_CHARACTERS, MIN_IMAGES};
use crate::services::assets;

#[tauri::command]
pub fn get_assets_dir() -> Result<String, String> {
    assets::resolve_assets_dir().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn get_manifest() -> Result<Manifest, String> {
    let dir = assets::resolve_assets_dir()?;
    let manifest_path = dir.join("manifest.json");
    let raw = std::fs::read_to_string(&manifest_path).map_err(|e| {
        format!(
            "Failed to read {}: {e}",
            manifest_path.to_string_lossy()
        )
    })?;
    serde_json::from_str(&raw).map_err(|e| format!("Invalid manifest JSON: {e}"))
}

#[tauri::command]
pub fn resolve_image_path(filename: String) -> Result<String, String> {
    assets::resolve_image_file(&filename).map(|p| p.to_string_lossy().into_owned())
}

pub fn check_assets_ready() -> bool {
    assets::count_ready_images() >= MIN_IMAGES && assets::count_manifest_characters() >= MIN_CHARACTERS
}

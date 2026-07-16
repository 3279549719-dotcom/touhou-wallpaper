use crate::services::assets;
use crate::services::favorites_storage;

#[tauri::command]
pub fn list_favorites() -> Result<Vec<String>, String> {
    favorites_storage::read_favorites()
}

#[tauri::command]
pub fn toggle_favorite(filename: String) -> Result<Vec<String>, String> {
    assets::resolve_image_file(&filename)?;
    favorites_storage::toggle(&filename)
}

/// TODO(M4): read %APPDATA%/touhou-wallpaper/favorites.json
#[tauri::command]
pub fn list_favorites() -> Result<Vec<String>, String> {
    Ok(vec![])
}

/// TODO(M4): toggle entry and persist JSON
#[tauri::command]
pub fn toggle_favorite(filename: String) -> Result<Vec<String>, String> {
    Ok(vec![filename])
}

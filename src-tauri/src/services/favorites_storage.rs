/// Favorites persistence service — read/write favorites.json.
use std::fs;
use std::path::PathBuf;

use crate::models::types::FavoritesFile;
use crate::services::assets::resolve_image_file;

pub fn favorites_path() -> Result<PathBuf, String> {
    let appdata = std::env::var("APPDATA").map_err(|_| "APPDATA environment variable not set")?;
    Ok(PathBuf::from(appdata)
        .join("touhou-wallpaper")
        .join("favorites.json"))
}

pub fn read_favorites() -> Result<Vec<String>, String> {
    let path = favorites_path()?;
    if !path.is_file() {
        return Ok(vec![]);
    }
    let raw = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {e}", path.to_string_lossy()))?;
    let data: FavoritesFile = serde_json::from_str(&raw)
        .map_err(|e| format!("Invalid favorites JSON: {e}"))?;
    Ok(data.favorites)
}

pub fn write_favorites(favorites: &[String]) -> Result<(), String> {
    let path = favorites_path()?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create {}: {e}", parent.to_string_lossy()))?;
    }
    let mut unique = favorites.to_vec();
    unique.sort();
    unique.dedup();
    let data = FavoritesFile { favorites: unique };
    let json = serde_json::to_string_pretty(&data)
        .map_err(|e| format!("Failed to serialize favorites: {e}"))?;
    fs::write(&path, json)
        .map_err(|e| format!("Failed to write {}: {e}", path.to_string_lossy()))
}

/// Returns the updated list after toggling.
pub fn toggle(filename: &str) -> Result<Vec<String>, String> {
    resolve_image_file(filename)?;
    let mut favorites = read_favorites()?;
    if let Some(index) = favorites.iter().position(|entry| entry == filename) {
        favorites.remove(index);
    } else {
        favorites.push(filename.to_string());
    }
    write_favorites(&favorites)?;
    Ok(favorites)
}

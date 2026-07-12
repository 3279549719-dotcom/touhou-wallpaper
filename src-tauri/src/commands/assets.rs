use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct Character {
    pub id: String,
    pub name: String,
    pub variants: u32,
    pub files: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Manifest {
    pub version: u32,
    pub source: String,
    #[serde(rename = "missingIds")]
    pub missing_ids: Vec<String>,
    pub characters: Vec<Character>,
}

fn resolve_assets_dir() -> Result<PathBuf, String> {
    if let Ok(env) = std::env::var("TOUHOU_WALLPAPER_ASSETS") {
        let dir = PathBuf::from(&env);
        if dir.join("manifest.json").is_file() {
            return dir
                .canonicalize()
                .map_err(|e| format!("Failed to canonicalize {env}: {e}"));
        }
    }

    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Ok(cwd) = std::env::current_dir() {
        candidates.push(cwd.join("assets"));
        candidates.push(cwd.join("../assets"));
    }
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            candidates.push(parent.join("assets"));
            candidates.push(parent.join("../assets"));
        }
    }
    candidates.push(PathBuf::from("assets"));
    candidates.push(PathBuf::from("../assets"));

    for candidate in candidates {
        if candidate.join("manifest.json").is_file() {
            return candidate.canonicalize().map_err(|e| {
                format!(
                    "Failed to canonicalize {}: {e}",
                    candidate.to_string_lossy()
                )
            });
        }
    }

    Err("Assets directory not found. Run: python scripts/download_assets.py".into())
}

fn validate_filename(filename: &str) -> Result<(), String> {
    if filename.is_empty()
        || filename.contains("..")
        || filename.contains('/')
        || filename.contains('\\')
    {
        return Err(format!("Invalid filename: {filename}"));
    }
    if !filename.ends_with(".png") {
        return Err(format!("Expected .png file: {filename}"));
    }
    Ok(())
}

pub(crate) fn resolve_image_file(filename: &str) -> Result<PathBuf, String> {
    validate_filename(filename)?;
    let assets = resolve_assets_dir()?;
    let image_path = assets.join("images").join(filename);
    if !image_path.is_file() {
        return Err(format!("Image not found: {}", image_path.to_string_lossy()));
    }
    image_path
        .canonicalize()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_assets_dir() -> Result<String, String> {
    resolve_assets_dir().map(|p| p.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn get_manifest() -> Result<Manifest, String> {
    let assets = resolve_assets_dir()?;
    let manifest_path = assets.join("manifest.json");
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
    resolve_image_file(&filename).map(|p| p.to_string_lossy().into_owned())
}

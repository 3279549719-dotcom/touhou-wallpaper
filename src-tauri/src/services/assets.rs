/// Assets directory resolution and manifest loading.
use std::path::PathBuf;

use crate::models::types::Manifest;

pub fn user_assets_dir() -> PathBuf {
    if let Ok(appdata) = std::env::var("APPDATA") {
        return PathBuf::from(appdata)
            .join("touhou-wallpaper")
            .join("assets");
    }
    PathBuf::from(".").join("touhou-wallpaper").join("assets")
}

fn dev_project_assets_dir() -> Option<PathBuf> {
    let cwd = std::env::current_dir().ok()?;
    let assets = cwd.join("assets");
    if assets.join("manifest.json").is_file() {
        return Some(assets);
    }
    if cwd.join("package.json").is_file() {
        return Some(assets);
    }
    None
}

pub fn writable_assets_dir() -> PathBuf {
    dev_project_assets_dir().unwrap_or_else(user_assets_dir)
}

pub fn resolve_assets_dir() -> Result<PathBuf, String> {
    if let Ok(env) = std::env::var("TOUHOU_WALLPAPER_ASSETS") {
        let dir = PathBuf::from(&env);
        if dir.join("manifest.json").is_file() {
            return dir
                .canonicalize()
                .map_err(|e| format!("Failed to canonicalize {env}: {e}"));
        }
    }

    let mut candidates: Vec<PathBuf> = Vec::new();

    if let Some(dev) = dev_project_assets_dir() {
        candidates.push(dev);
    }

    let user = user_assets_dir();
    candidates.push(user.clone());

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

    Err("Assets not found. Use in-app download on first launch.".into())
}

pub fn count_manifest_characters() -> usize {
    match resolve_assets_dir() {
        Ok(dir) => {
            let path = dir.join("manifest.json");
            if let Ok(raw) = std::fs::read_to_string(path) {
                if let Ok(m) = serde_json::from_str::<Manifest>(&raw) {
                    return m.characters.len();
                }
            }
            0
        }
        Err(_) => 0,
    }
}

pub fn count_ready_images() -> usize {
    match resolve_assets_dir() {
        Ok(dir) => std::fs::read_dir(dir.join("images"))
            .map(|entries| {
                entries
                    .filter_map(|e| e.ok())
                    .filter(|e| e.path().extension().is_some_and(|x| x == "png"))
                    .count()
            })
            .unwrap_or(0),
        Err(_) => 0,
    }
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

pub fn resolve_image_file(filename: &str) -> Result<PathBuf, String> {
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

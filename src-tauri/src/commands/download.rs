use std::fs;

use serde_json;
use tauri::{AppHandle, Emitter};

use crate::commands::assets::check_assets_ready;
use crate::models::types::{DownloadProgress, MIN_CHARACTERS, MIN_IMAGES};
use crate::services::assets::writable_assets_dir;
use crate::services::http::{http_get, download_file, pad_id};
use crate::services::manifest::build_manifest;

const BASE_URL: &str = "https://thpdp.ver.moe";
const ID_MIN: i32 = 1;
const ID_MAX: i32 = 131;

fn emit_progress(app: &AppHandle, completed: usize, total: usize, current: &str, phase: &str) {
    let _ = app.emit(
        "download-progress",
        DownloadProgress {
            completed,
            total,
            current_file: current.to_string(),
            phase: phase.to_string(),
        },
    );
}

#[tauri::command]
pub fn assets_ready() -> bool {
    check_assets_ready()
}

#[tauri::command]
pub async fn download_assets(app: AppHandle) -> Result<(), String> {
    let assets_dir = writable_assets_dir();
    let images_dir = assets_dir.join("images");
    fs::create_dir_all(&images_dir).map_err(|e| e.to_string())?;

    emit_progress(&app, 0, 1, "id-name.json", "fetch_metadata");
    let raw_bytes = http_get(&format!("{BASE_URL}/id-name.json"))?;
    let raw: serde_json::Map<String, serde_json::Value> =
        serde_json::from_slice(&raw_bytes).map_err(|e| e.to_string())?;

    let subset: serde_json::Map<String, serde_json::Value> = raw
        .iter()
        .filter(|(k, _)| k.chars().all(|c| c.is_ascii_digit()))
        .filter(|(k, _)| {
            let n: i32 = k.parse().unwrap_or(0);
            (ID_MIN..=ID_MAX).contains(&n)
        })
        .map(|(k, v)| (pad_id(k), v.clone()))
        .collect();

    let id_name_path = assets_dir.join("id-name.json");
    fs::write(
        &id_name_path,
        serde_json::to_string_pretty(&subset).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    let manifest = build_manifest(&raw);
    let characters = manifest["characters"]
        .as_array()
        .ok_or("Invalid manifest characters")?;

    let mut tasks: Vec<(String, std::path::PathBuf)> = Vec::new();
    for ch in characters {
        let files = ch["files"]
            .as_array()
            .ok_or("Invalid character files")?;
        for file in files {
            let fname = file.as_str().ok_or("Invalid filename")?;
            tasks.push((
                format!("{BASE_URL}/images/{fname}"),
                images_dir.join(fname),
            ));
        }
    }

    let total = tasks.len();
    let mut failed: Vec<String> = Vec::new();

    for (i, (url, dest)) in tasks.iter().enumerate() {
        let fname = dest
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or("image.png");
        emit_progress(&app, i, total, fname, "download_images");
        if let Err(e) = download_file(url, dest) {
            failed.push(format!("{fname}: {e}"));
        }
    }

    let manifest_path = assets_dir.join("manifest.json");
    fs::write(
        &manifest_path,
        serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;

    emit_progress(&app, total, total, "done", "complete");

    let on_disk = fs::read_dir(&images_dir)
        .map_err(|e| e.to_string())?
        .filter_map(|e| e.ok())
        .filter(|e| e.path().extension().is_some_and(|x| x == "png"))
        .count();

    if !failed.is_empty() {
        return Err(format!(
            "Download incomplete: {} failed, {} on disk. First: {}",
            failed.len(),
            on_disk,
            failed.first().unwrap_or(&String::new())
        ));
    }

    if characters.len() < MIN_CHARACTERS {
        return Err(format!(
            "Expected >={MIN_CHARACTERS} characters, got {}",
            characters.len()
        ));
    }
    if on_disk < MIN_IMAGES {
        return Err(format!(
            "Expected >={MIN_IMAGES} images, got {on_disk}"
        ));
    }

    Ok(())
}

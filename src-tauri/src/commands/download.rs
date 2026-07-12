use serde::Serialize;
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::time::Duration;
use tauri::{AppHandle, Emitter};

use super::assets::{writable_assets_dir, MIN_CHARACTERS, MIN_IMAGES};

const BASE_URL: &str = "https://thpdp.ver.moe";
const ID_MIN: i32 = 1;
const ID_MAX: i32 = 131;
const RETRIES: u32 = 3;

#[derive(Debug, Serialize, Clone)]
pub struct DownloadProgress {
    pub completed: usize,
    pub total: usize,
    pub current_file: String,
    pub phase: String,
}

#[derive(Debug, serde::Deserialize)]
struct IdNameEntry {
    names: Option<Vec<String>>,
    variants: Option<u32>,
}

fn pad_id(raw_id: &str) -> String {
    format!("{:03}", raw_id.parse::<i32>().unwrap_or(0))
}

fn build_manifest(raw: &serde_json::Map<String, serde_json::Value>) -> serde_json::Value {
    let mut keys: Vec<&String> = raw.keys().collect();
    keys.sort_by_key(|k| k.parse::<i32>().unwrap_or(0));

    let mut characters = Vec::new();
    for key in keys {
        if !key.chars().all(|c| c.is_ascii_digit()) {
            continue;
        }
        let num: i32 = key.parse().unwrap_or(0);
        if num < ID_MIN || num > ID_MAX {
            continue;
        }
        let cid = pad_id(key);
        let entry: IdNameEntry =
            serde_json::from_value(raw[key].clone()).unwrap_or(IdNameEntry {
                names: None,
                variants: None,
            });
        let variants = entry.variants.unwrap_or(0);
        let name = entry
            .names
            .as_ref()
            .and_then(|n| n.first())
            .cloned()
            .unwrap_or_default();
        let files: Vec<String> = (0..variants)
            .map(|i| format!("{cid}_{:02}", i))
            .collect();
        characters.push(serde_json::json!({
            "id": cid,
            "name": name,
            "variants": variants,
            "files": files,
        }));
    }

    serde_json::json!({
        "version": 1,
        "source": BASE_URL,
        "missingIds": ["011", "013", "024", "028", "034"],
        "characters": characters,
    })
}

fn http_get(url: &str) -> Result<Vec<u8>, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("touhou-wallpaper/0.1")
        .build()
        .map_err(|e| e.to_string())?;
    for attempt in 1..=RETRIES {
        match client.get(url).send() {
            Ok(resp) => {
                if resp.status().is_success() {
                    return resp.bytes().map(|b| b.to_vec()).map_err(|e| e.to_string());
                }
                if attempt == RETRIES {
                    return Err(format!("HTTP {} for {url}", resp.status()));
                }
            }
            Err(e) if attempt == RETRIES => return Err(e.to_string()),
            Err(_) => std::thread::sleep(Duration::from_millis(500 * attempt as u64)),
        }
    }
    Err(format!("Failed to fetch {url}"))
}

fn download_file(url: &str, dest: &Path) -> Result<(), String> {
    if dest.is_file() {
        if let Ok(meta) = dest.metadata() {
            if meta.len() > 0 {
                return Ok(());
            }
        }
    }
    if let Some(parent) = dest.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let bytes = http_get(url)?;
    let mut file = fs::File::create(dest).map_err(|e| e.to_string())?;
    file.write_all(&bytes).map_err(|e| e.to_string())?;
    Ok(())
}

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
    super::assets::count_ready_images() >= MIN_IMAGES
        && super::assets::count_manifest_characters() >= MIN_CHARACTERS
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

    let mut tasks: Vec<(String, PathBuf)> = Vec::new();
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

/// HTTP download helper — fetch files with retries.
use std::fs;
use std::io::Write;
use std::path::Path;
use std::time::Duration;

pub fn http_get(url: &str) -> Result<Vec<u8>, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(Duration::from_secs(30))
        .user_agent("touhou-wallpaper/0.1")
        .build()
        .map_err(|e| e.to_string())?;
    const RETRIES: u32 = 3;
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

pub fn download_file(url: &str, dest: &Path) -> Result<(), String> {
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

pub fn pad_id(raw_id: &str) -> String {
    format!("{:03}", raw_id.parse::<i32>().unwrap_or(0))
}

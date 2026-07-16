use crate::services::assets;

#[tauri::command]
pub fn get_current_wallpaper() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        return crate::services::registry::read_current_wallpaper();
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("get_current_wallpaper is only supported on Windows".into())
    }
}

#[tauri::command]
pub fn set_wallpaper(filename: String) -> Result<(), String> {
    let image_path = assets::resolve_image_file(&filename)?;
    #[cfg(target_os = "windows")]
    {
        crate::services::registry::set_desktop_wallpaper(&image_path)?;
        let current = crate::services::registry::read_current_wallpaper()?;
        let expected = image_path.to_string_lossy().to_string();
        if !paths_equal(&current, &expected) {
            return Err(format!(
                "Wallpaper registry mismatch: expected {expected}, got {current}"
            ));
        }
        return Ok(());
    }
    #[cfg(not(target_os = "windows"))]
    {
        let _ = image_path;
        Err("set_wallpaper is only supported on Windows".into())
    }
}

fn paths_equal(left: &str, right: &str) -> bool {
    let a = std::path::Path::new(left);
    let b = std::path::Path::new(right);
    a.canonicalize()
        .ok()
        .zip(b.canonicalize().ok())
        .map(|(x, y)| x == y)
        .unwrap_or_else(|| left.eq_ignore_ascii_case(right))
}

/// TODO(M3): read HKCU\\Control Panel\\Desktop\\Wallpaper
#[tauri::command]
pub fn get_current_wallpaper() -> Result<String, String> {
    Ok(String::new())
}

/// TODO(M3): SPI_SETDESKTOPWALLPAPER — only called from UI Apply button
#[tauri::command]
pub fn set_wallpaper(filename: String) -> Result<(), String> {
    let _ = filename;
    Ok(())
}

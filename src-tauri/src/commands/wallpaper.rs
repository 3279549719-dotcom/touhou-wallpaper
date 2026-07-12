use super::assets::resolve_image_file;

#[cfg(target_os = "windows")]
mod win {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use std::path::Path;
    use windows::Win32::UI::WindowsAndMessaging::{
        SystemParametersInfoW, SPI_SETDESKTOPWALLPAPER, SPIF_SENDWININICHANGE, SPIF_UPDATEINIFILE,
    };
    use winreg::enums::*;
    use winreg::RegKey;

    fn to_wide_null(path: &str) -> Vec<u16> {
        OsStr::new(path)
            .encode_wide()
            .chain(std::iter::once(0))
            .collect()
    }

    pub fn read_current_wallpaper() -> Result<String, String> {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let desktop = hkcu
            .open_subkey("Control Panel\\Desktop")
            .map_err(|e| format!("Failed to open registry key: {e}"))?;
        desktop
            .get_value::<String, _>("Wallpaper")
            .map_err(|e| format!("Failed to read Wallpaper registry value: {e}"))
    }

    pub fn set_desktop_wallpaper(path: &Path) -> Result<(), String> {
        let wide = to_wide_null(&path.to_string_lossy());
        unsafe {
            SystemParametersInfoW(
                SPI_SETDESKTOPWALLPAPER,
                0,
                Some(wide.as_ptr() as *mut _),
                SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE,
            )
            .map_err(|e| format!("SystemParametersInfoW failed: {e}"))?;
        }
        Ok(())
    }
}

#[tauri::command]
pub fn get_current_wallpaper() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        return win::read_current_wallpaper();
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err("get_current_wallpaper is only supported on Windows".into())
    }
}

#[tauri::command]
pub fn set_wallpaper(filename: String) -> Result<(), String> {
    let image_path = resolve_image_file(&filename)?;
    #[cfg(target_os = "windows")]
    {
        win::set_desktop_wallpaper(&image_path)?;
        let current = win::read_current_wallpaper()?;
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

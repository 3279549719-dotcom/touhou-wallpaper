/// Windows registry wallpaper operations.
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::path::Path;
use windows::Win32::UI::WindowsAndMessaging::{
    SystemParametersInfoW, SPI_SETDESKWALLPAPER, SPIF_SENDWININICHANGE, SPIF_UPDATEINIFILE,
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

pub fn apply_fit_style() -> Result<(), String> {
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let desktop = hkcu
        .open_subkey_with_flags("Control Panel\\Desktop", KEY_SET_VALUE)
        .map_err(|e| format!("Failed to open registry key for write: {e}"))?;
    desktop
        .set_value("WallpaperStyle", &"6")
        .map_err(|e| format!("Failed to set WallpaperStyle: {e}"))?;
    desktop
        .set_value("TileWallpaper", &"0")
        .map_err(|e| format!("Failed to set TileWallpaper: {e}"))?;
    Ok(())
}

pub fn set_desktop_wallpaper(path: &Path) -> Result<(), String> {
    let wide = to_wide_null(&path.to_string_lossy());
    unsafe {
        SystemParametersInfoW(
            SPI_SETDESKWALLPAPER,
            0,
            Some(wide.as_ptr() as *mut _),
            SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE,
        )
        .map_err(|e| format!("SystemParametersInfoW failed: {e}"))?;
    }
    apply_fit_style()?;
    unsafe {
        SystemParametersInfoW(
            SPI_SETDESKWALLPAPER,
            0,
            Some(wide.as_ptr() as *mut _),
            SPIF_UPDATEINIFILE | SPIF_SENDWININICHANGE,
        )
        .map_err(|e| format!("SystemParametersInfoW failed on refresh: {e}"))?;
    }
    Ok(())
}

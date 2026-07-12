mod commands;

use commands::assets::{get_assets_dir, get_manifest, resolve_image_path};
use commands::favorites::{list_favorites, toggle_favorite};
use commands::wallpaper::{get_current_wallpaper, set_wallpaper};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_manifest,
            get_assets_dir,
            resolve_image_path,
            get_current_wallpaper,
            set_wallpaper,
            list_favorites,
            toggle_favorite,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

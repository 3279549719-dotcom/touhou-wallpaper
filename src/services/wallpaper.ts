/** Wallpaper service — get/set system wallpaper. */
import { strings } from "../lib/strings";

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function getCurrentWallpaper(): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string>("get_current_wallpaper");
  }
  try {
    const res = await fetch("/api/wallpaper");
    if (!res.ok) return "";
    const data = (await res.json()) as { path?: string };
    return data.path ?? "";
  } catch {
    return "";
  }
}

export async function setWallpaper(filename: string): Promise<void> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    await invoke("set_wallpaper", { filename });
    return;
  }
  const res = await fetch("/api/wallpaper", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });
  const data = (await res.json()) as { ok?: boolean; error?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.error ?? `${strings.applyFailed} (${res.status})`);
  }
}

export async function wallpaperPathToImageUrl(
  path: string | null,
): Promise<string | null> {
  if (!path) return null;

  const normalized = path.replace(/\\/g, "/");
  const marker = "/assets/images/";
  const idx = normalized.toLowerCase().indexOf(marker);
  if (idx >= 0) {
    return `/assets/images/${normalized.slice(idx + marker.length)}`;
  }

  if (isTauri()) {
    const { convertFileSrc } = await import("@tauri-apps/api/core");
    return convertFileSrc(path);
  }

  return null;
}

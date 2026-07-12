import type { Manifest } from "../types/manifest";

const MOCK_MANIFEST: Manifest = {
  version: 1,
  source: "https://thpdp.ver.moe/",
  missingIds: ["011", "013", "024", "028", "034"],
  characters: [
    {
      id: "001",
      name: "博丽灵梦",
      variants: 2,
      files: ["001_00.png", "001_01.png"],
    },
    {
      id: "002",
      name: "雾雨魔理沙",
      variants: 2,
      files: ["002_00.png", "002_01.png"],
    },
  ],
};

function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

async function loadLocalManifest(): Promise<Manifest | null> {
  try {
    const res = await fetch("/assets/manifest.json");
    if (!res.ok) return null;
    return (await res.json()) as Manifest;
  } catch {
    return null;
  }
}

export async function getManifest(): Promise<Manifest> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Manifest>("get_manifest");
  }
  const local = await loadLocalManifest();
  return local ?? MOCK_MANIFEST;
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
    throw new Error(data.error ?? `set_wallpaper failed (${res.status})`);
  }
}

export async function listFavorites(): Promise<string[]> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string[]>("list_favorites");
  }
  return [];
}

export async function toggleFavorite(filename: string): Promise<string[]> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string[]>("toggle_favorite", { filename });
  }
  return [filename];
}

export async function resolveImagePath(filename: string): Promise<string> {
  if (isTauri()) {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<string>("resolve_image_path", { filename });
  }
  return `/assets/images/${filename}`;
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

export function getActiveFilename(
  characterId: string,
  variantIndex: number,
  manifest: Manifest | null,
): string | null {
  if (!manifest) return null;
  const character = manifest.characters.find((c) => c.id === characterId);
  if (!character) return null;
  return character.files[variantIndex] ?? character.files[0] ?? null;
}

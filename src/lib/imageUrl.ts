function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

const urlCache = new Map<string, string>();

export async function getAssetImageUrl(filename: string): Promise<string> {
  if (!filename) return "";
  if (urlCache.has(filename)) {
    return urlCache.get(filename)!;
  }

  if (!isTauri()) {
    const url = `/assets/images/${filename}`;
    urlCache.set(filename, url);
    return url;
  }

  const { invoke, convertFileSrc } = await import("@tauri-apps/api/core");
  const path = await invoke<string>("resolve_image_path", { filename });
  const url = convertFileSrc(path);
  urlCache.set(filename, url);
  return url;
}

export function clearAssetImageUrlCache(): void {
  urlCache.clear();
}

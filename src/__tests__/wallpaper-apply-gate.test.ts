import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(
  typeof import.meta.dirname === "string"
    ? import.meta.dirname
    : dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);

function readSrc(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

describe("wallpaper apply gate", () => {
  it("useWallpaperApp calls setWallpaper only inside applyWallpaper", () => {
    const hook = readSrc("src/hooks/useWallpaperApp.ts");
    const matches = hook.match(/setWallpaper\(/g) ?? [];
    expect(matches.length).toBe(1);
    expect(hook).toMatch(/const applyWallpaper = useCallback\(async \(\) => \{/);
    const applyStart = hook.indexOf("const applyWallpaper = useCallback");
    expect(applyStart).toBeGreaterThanOrEqual(0);
    const applyBlock = hook.slice(applyStart, applyStart + 500);
    expect(applyBlock).toContain("setWallpaper");
  });

  it("navigation helpers do not call setWallpaper", () => {
    const hook = readSrc("src/hooks/useWallpaperApp.ts");
    for (const name of [
      "selectCharacter",
      "selectVariant",
      "stepCharacter",
      "randomCharacter",
    ] as const) {
      const re = new RegExp(
        `const ${name} = useCallback\\([\\s\\S]*?\\n  \\},`,
      );
      const block = hook.match(re)?.[0] ?? "";
      expect(block.length).toBeGreaterThan(0);
      expect(block.includes("setWallpaper")).toBe(false);
    }
  });

  it("App and presentational panels do not call setWallpaper directly", () => {
    const forbidden = [
      "src/App.tsx",
      "src/components/nav/ActionBar.tsx",
      "src/components/nav/CharacterNav.tsx",
      "src/components/sidebars/CharacterSidebar.tsx",
      "src/components/panels/VariantStrip.tsx",
      "src/components/panels/PreviewPane.tsx",
    ];
    for (const rel of forbidden) {
      const text = readSrc(rel);
      expect(text.includes("setWallpaper")).toBe(false);
    }
  });
});

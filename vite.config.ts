import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(rootDir, "assets");
const wallpaperService = path.resolve(
  rootDir,
  "scripts/build/wallpaper_service.py",
);

function runWallpaperService(args: string[]) {
  return spawnSync("python", [wallpaperService, ...args], {
    cwd: rootDir,
    encoding: "utf-8",
  });
}

function readJsonBody(
  req: import("http").IncomingMessage,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function wallpaperDevApi(): Plugin {
  return {
    name: "wallpaper-dev-api",
    configureServer(server) {
      server.middlewares.use("/api/wallpaper", async (req, res, _next) => {
        if (req.method === "GET") {
          const result = runWallpaperService(["get"]);
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          if (result.status !== 0) {
            res.statusCode = 500;
            res.end(result.stderr || result.stdout || '{"ok":false}');
            return;
          }
          res.end(result.stdout);
          return;
        }

        if (req.method === "POST") {
          try {
            const body = await readJsonBody(req);
            const filename = String(body.filename ?? "");
            const result = runWallpaperService(["set", filename]);
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            if (result.status !== 0) {
              res.statusCode = 400;
              res.end(result.stderr || result.stdout || '{"ok":false}');
              return;
            }
            res.end(result.stdout);
          } catch (error) {
            res.statusCode = 400;
            res.end(
              JSON.stringify({
                ok: false,
                error: error instanceof Error ? error.message : String(error),
              }),
            );
          }
          return;
        }

        res.statusCode = 405;
        res.end('{"ok":false,"error":"Method not allowed"}');
      });
    },
  };
}

function serveAssetsDir(): Plugin {
  return {
    name: "serve-assets-dir",
    configureServer(server) {
      server.middlewares.use("/assets", (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? "/").split("?")[0]);
        const rel = urlPath.replace(/^\/+/, "");
        const filePath = path.resolve(assetsDir, rel);
        if (!filePath.startsWith(assetsDir + path.sep) && filePath !== assetsDir) {
          res.statusCode = 403;
          res.end("Forbidden");
          return;
        }
        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        if (ext === ".png") res.setHeader("Content-Type", "image/png");
        if (ext === ".json") res.setHeader("Content-Type", "application/json");
        fs.createReadStream(filePath).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), serveAssetsDir(), wallpaperDevApi()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ["VITE_", "TAURI_"],
  build: {
    target: "es2022",
    minify: "esbuild",
    sourcemap: false,
  },
});

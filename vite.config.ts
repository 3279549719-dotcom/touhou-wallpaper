import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(rootDir, "assets");

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
  plugins: [react(), serveAssetsDir()],
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

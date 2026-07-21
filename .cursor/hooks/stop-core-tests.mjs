import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "{}";
  }
}

const raw = readStdin();
let payload = {};
try {
  payload = JSON.parse(raw || "{}");
} catch {
  payload = {};
}

const status = payload.status ?? "completed";
if (status === "aborted" || status === "error") {
  process.stdout.write("{}\n");
  process.exit(0);
}

const result = spawnSync("npm", ["run", "test:core"], {
  encoding: "utf8",
  shell: true,
  cwd: process.cwd(),
  env: process.env,
});

if (result.status === 0) {
  process.stdout.write("{}\n");
  process.exit(0);
}

const out = `${result.stdout ?? ""}\n${result.stderr ?? ""}`.trim();
const clipped = out.slice(0, 3500);
const followup_message = [
  "Quality harness: `npm run test:core` failed after your turn.",
  "Fix the failing core tests, then finish the task.",
  "Do not skip tests. Full CI still runs `npm test` on PR.",
  "",
  clipped || "(no output captured)",
].join("\n");

process.stdout.write(JSON.stringify({ followup_message }) + "\n");
process.exit(0);

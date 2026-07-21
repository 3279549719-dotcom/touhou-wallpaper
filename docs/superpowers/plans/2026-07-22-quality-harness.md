# Quality Harness (Plan 1 + thin Plan 3.1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a documented quality delivery loop with core Vitest coverage, `npm run test:core`, an English agent review checklist, and a Cursor `stop` hook that re-prompts on core-test failures—without changing GitHub Autofix or doing structural refactor.

**Architecture:** Docs define the loop (standard → edge table → Vitest → English checklist → local core gate → GitHub full gate). Core tests live under `src/__tests__/` and are selected by a dedicated npm script. The Cursor `stop` hook runs only that script via a Windows-friendly Node helper. Clear-search product work and Plan 2 refactor are out of scope for this branch.

**Tech Stack:** Vitest, TypeScript/React (existing), Cursor project hooks (Node `.mjs`), GitHub Actions Autofix (unchanged).

## Global Constraints

- Work only on branch `chore/quality-harness` (or equivalent); never commit harness work directly on `master`.
- Code and comments: English only; UI copy from CONTENT/strings.
- Only Apply may call `setWallpaper` / `set_wallpaper`.
- Do not weaken GitHub Autofix workflows; do not add ESLint/Prettier/Husky/Git pre-commit.
- Do not implement clear-search product UI in this PR (tests for existing `clearSearch` are OK).
- Plan 2 refactor is suspended.
- After real progress: update `docs/dev/PROGRESS.md` (pulse schema v1).

**Spec:** `docs/superpowers/specs/2026-07-21-quality-test-harness-plan.md`  
**Index:** `docs/superpowers/specs/2026-07-21-quality-overhaul-index.md`

## File map

| File | Role |
|------|------|
| `docs/dev/REVIEW_CHECKLIST.md` | English agent review checklist (create) |
| `docs/dev/VERIFY.md` | Four layers + edge-table policy + local vs CI (modify) |
| `AGENTS.md` | Done means + pointers to checklist / harness (modify) |
| `package.json` | Add `test:core` script (modify) |
| `src/__tests__/search.test.ts` | Extend clear-search / search edges if gaps (modify) |
| `src/__tests__/useCharacterSearch.test.ts` | Hook clear/isSearching tests (create) |
| `src/__tests__/favorites.test.ts` | Keep/extend favorites edges (modify if needed) |
| `src/__tests__/wallpaper-apply-gate.test.ts` | Apply-only contract scan (create) |
| `.cursor/hooks.json` | `stop` hook config (create) |
| `.cursor/hooks/stop-core-tests.mjs` | Run `test:core`, emit followup JSON (create) |
| `docs/dev/PROGRESS.md` | Pulse update (modify) |
| `README.md` | One-line local vs CI if needed (modify lightly) |

---

### Task 1: English checklist + AGENTS / VERIFY wiring

**Files:**
- Create: `docs/dev/REVIEW_CHECKLIST.md`
- Modify: `AGENTS.md`
- Modify: `docs/dev/VERIFY.md` (top sections: layers, delivery policy, local vs CI)
- Test: n/a (docs); spot-check links resolve

**Interfaces:**
- Consumes: merged spec decisions (policy B, English checklist, `test:core` vs full `npm test`)
- Produces: agents can follow Done means → REVIEW_CHECKLIST; VERIFY documents edge table + Cursor stop + GitHub judge

- [ ] **Step 1: Create `docs/dev/REVIEW_CHECKLIST.md`** with exactly this content:

```markdown
# Review checklist (for Agents)

Run before claiming a non-style feature is done. Reply with PASS / FAIL per item.

## Behavior

- [ ] Happy path matches the stated Chinese standard (normal / edges / error copy / wallpaper may change?)
- [ ] Edge table covered by Vitest, or explicitly marked skip (style/copy-only)
- [ ] Failures show friendly UI/error strings (no silent break)
- [ ] Only Apply calls `setWallpaper` / `set_wallpaper` (not next / wheel / thumbnail / clear / search)

## Tests

- [ ] Core logic has Vitest (normal + at least one edge)
- [ ] `npm run test:core` passes when this change touches core areas
- [ ] `npm test` passes before PR
- [ ] Wiring `verify_*.py` updated or still green if this module needs it

## Scope & safety

- [ ] No unrelated refactor or drive-by edits
- [ ] No secrets, no `assets/images/` commits, no paywall/login shortcuts
- [ ] CONTENT/strings updated if user-visible copy changed
- [ ] PROGRESS.md updated if this session made real progress

## Output

End with: `REVIEW_CHECKLIST: PASS` or list FAIL items.
```

- [ ] **Step 2: Update root `AGENTS.md`** — after "Done means", insert:

```markdown
## Feature delivery (non-style)

For every non-style feature on a **feature branch**:

1. Short Chinese standard: normal / edges / error hints / may desktop wallpaper change?
2. Edge table (or mark style/copy skip) — policy B
3. Vitest with the implementation (important rules may TDD: fail then pass)
4. Self-check [docs/dev/REVIEW_CHECKLIST.md](docs/dev/REVIEW_CHECKLIST.md) (English)
5. Local: `npm run test:core` (fast) and before PR `npm test`; CI judge remains GitHub Autofix (`tsc` + full vitest)
6. Human: minimal clicks (real wallpaper only when needed)

Quality harness plan: [docs/superpowers/specs/2026-07-21-quality-test-harness-plan.md](docs/superpowers/specs/2026-07-21-quality-test-harness-plan.md)
```

Keep existing Hard rules and CI autofix sections.

- [ ] **Step 3: Update `docs/dev/VERIFY.md`** — replace the "四层检查" intro table/section so it includes:

- Layer note: 本地 Cursor `stop` 可催 `npm run test:core`；**合入裁判仍是 GitHub** 全量 `tsc`+`vitest`
- Policy B: 非纯样式默认要边界表 + Vitest
- Pointer to English `REVIEW_CHECKLIST.md`
- Commands: document `npm run test:core` next to `npm test`

Do not delete module-specific M0–M9 sections.

- [ ] **Step 4: Commit**

```bash
git add docs/dev/REVIEW_CHECKLIST.md AGENTS.md docs/dev/VERIFY.md
git commit -m "$(cat <<'EOF'
docs: add English review checklist and harness delivery rules

EOF
)"
```

On Windows PowerShell, if heredoc fails, use:

```powershell
git add docs/dev/REVIEW_CHECKLIST.md AGENTS.md docs/dev/VERIFY.md
git commit -m "docs: add English review checklist and harness delivery rules"
```

---

### Task 2: Add `npm run test:core`

**Files:**
- Modify: `package.json` scripts
- Test: run the new script (may fail until later tasks add files—initially point only at existing core files)

**Interfaces:**
- Consumes: existing `src/__tests__/search.test.ts`, `src/__tests__/favorites.test.ts`
- Produces: `npm run test:core` script used by the stop hook

- [ ] **Step 1: Add script** to `package.json` `"scripts"`:

```json
"test:core": "vitest run src/__tests__/search.test.ts src/__tests__/favorites.test.ts src/__tests__/useCharacterSearch.test.ts src/__tests__/wallpaper-apply-gate.test.ts"
```

Keep `"test": "vitest run"` unchanged (full suite for CI).

- [ ] **Step 2: Run full suite baseline**

Run: `npm test`  
Expected: PASS (current repo green). Note: `test:core` will fail until Tasks 3–4 create the two new files—that is OK if you create empty/failing placeholders in those tasks next; prefer completing Task 3–4 before relying on `test:core`.

- [ ] **Step 3: Commit** after Tasks 3–4 land the missing files (or commit script alone only if you temporarily limit `test:core` to the two existing files, then expand—prefer one commit with script + new tests in Task 4 end). Prefer: implement Task 3 and 4, then single commit for `test:core` + new tests.

---

### Task 3: Clear-search / `useCharacterSearch` Vitest

**Files:**
- Create: `src/__tests__/useCharacterSearch.test.ts`
- Modify: `src/__tests__/search.test.ts` only if a clear gap remains (empty query already covered)
- Test: `src/__tests__/useCharacterSearch.test.ts`

**Interfaces:**
- Consumes: `useCharacterSearch` from `src/hooks/useCharacterSearch.ts` (`query`, `setQuery`, `clearSearch`, `isSearching`)
- Produces: tests proving clear resets query and `isSearching`

- [ ] **Step 1: Write failing/meaningful tests** in `src/__tests__/useCharacterSearch.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterSearch } from "../hooks/useCharacterSearch";

describe("useCharacterSearch", () => {
  it("clearSearch empties query and isSearching becomes false", () => {
    const { result } = renderHook(() => useCharacterSearch());
    act(() => {
      result.current.setQuery("灵梦");
    });
    expect(result.current.isSearching).toBe(true);
    act(() => {
      result.current.clearSearch();
    });
    expect(result.current.query).toBe("");
    expect(result.current.isSearching).toBe(false);
  });

  it("whitespace-only query is not searching", () => {
    const { result } = renderHook(() => useCharacterSearch());
    act(() => {
      result.current.setQuery("   ");
    });
    expect(result.current.isSearching).toBe(false);
  });
});
```

If `@testing-library/react` is not installed, add it as a devDependency:

Run: `npm install -D @testing-library/react`

- [ ] **Step 2: Run test**

Run: `npx vitest run src/__tests__/useCharacterSearch.test.ts`  
Expected: PASS (hook already implements this behavior)

- [ ] **Step 3: Commit** (may batch with Task 4)

```powershell
git add src/__tests__/useCharacterSearch.test.ts package.json package-lock.json
git commit -m "test: cover useCharacterSearch clear and isSearching"
```

---

### Task 4: Apply-only wallpaper gate Vitest

**Files:**
- Create: `src/__tests__/wallpaper-apply-gate.test.ts`
- Test: same file
- Align with spirit of `scripts/verify/verify_m7.py` (source contract)

**Interfaces:**
- Consumes: source text of `src/hooks/useWallpaperApp.ts`, `src/App.tsx`, and UI components that must not call setWallpaper
- Produces: Vitest failures if Apply-only rule regresses

- [ ] **Step 1: Write `src/__tests__/wallpaper-apply-gate.test.ts`:**

```typescript
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..", "..");

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
```

Paths match the current `src/components/{nav,panels,sidebars}/` layout.

- [ ] **Step 2: Run**

Run: `npx vitest run src/__tests__/wallpaper-apply-gate.test.ts`  
Expected: PASS

- [ ] **Step 3: Ensure `test:core` lists all four files** (Task 2 script) and run:

Run: `npm run test:core`  
Expected: PASS

Run: `npm test`  
Expected: PASS

- [ ] **Step 4: Commit**

```powershell
git add package.json src/__tests__/useCharacterSearch.test.ts src/__tests__/wallpaper-apply-gate.test.ts
git commit -m "test: add core suite script and apply-only wallpaper gate"
```

---

### Task 5: Cursor `stop` hook (core tests only)

**Files:**
- Create: `.cursor/hooks/stop-core-tests.mjs`
- Create: `.cursor/hooks.json`
- Test: manual — run script with fake stdin; optional deliberate red test

**Interfaces:**
- Consumes: stdin JSON with `status`, `loop_count`; runs `npm run test:core`
- Produces: stdout `{}` on green/skip; `{ "followup_message": "..." }` on red

- [ ] **Step 1: Create `.cursor/hooks/stop-core-tests.mjs`:**

```javascript
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
```

- [ ] **Step 2: Create `.cursor/hooks.json`:**

```json
{
  "version": 1,
  "hooks": {
    "stop": [
      {
        "command": "node .cursor/hooks/stop-core-tests.mjs",
        "loop_limit": 3,
        "timeout": 120
      }
    ]
  }
}
```

- [ ] **Step 3: Smoke the script**

Run (PowerShell):

```powershell
'{ "status": "completed", "loop_count": 0 }' | node .cursor/hooks/stop-core-tests.mjs
```

Expected: prints `{}` when core tests are green.

- [ ] **Step 4: Document one line in VERIFY** under commands: Cursor stop runs `test:core` with loop_limit 3.

- [ ] **Step 5: Commit**

```powershell
git add .cursor/hooks.json .cursor/hooks/stop-core-tests.mjs docs/dev/VERIFY.md
git commit -m "chore: add Cursor stop hook for core Vitest gate"
```

---

### Task 6: Pulse + README alignment + final verify

**Files:**
- Modify: `docs/dev/PROGRESS.md`
- Modify: `README.md` only if install/use commands omit `test` / `test:core`
- Modify: `docs/superpowers/specs/2026-07-21-refactor-structure-plan.md` optional one-line "suspended 2026-07-22" at top if not already clear from index

**Interfaces:**
- Consumes: harness completion state
- Produces: accurate Next prompt pointing at `feature/clear-search`

- [ ] **Step 1: Update PROGRESS.md** Snapshot:

- Phase: 质量闭环合入中 / 或已可 PR
- Branch: `chore/quality-harness`
- Modules: Plan1 harness `[~]` or `[x]` when PR-ready; Plan3 archived into harness; Plan2 `[ ]` 挂起; 清空搜索 `[ ]` 下一步
- Recent: one line about merged harness
- Next: open `feature/clear-search` using new delivery loop

- [ ] **Step 2: Final commands**

Run: `npm run test:core`  
Expected: PASS  

Run: `npm test`  
Expected: PASS  

- [ ] **Step 3: Commit**

```powershell
git add docs/dev/PROGRESS.md README.md
git commit -m "docs: pulse quality harness ready; next clear-search"
```

- [ ] **Step 4: Stop** — do not merge to master without human PR review. Push branch only if user asks.

---

## Out of scope (do not implement in this plan)

- `feature/clear-search` product changes
- Plan 2 structure refactor
- ESLint / Prettier / Husky / git pre-commit
- Changing `.github/workflows/**`

## Self-review

1. **Spec coverage:** H.1→Task1; H.2→Tasks2–4; H.3→Task5; H.4→Task1/6; H.5 deferred. Hook = `test:core` (Q1B). Plan3 archived. Branch required.
2. **Placeholders:** none intentional.
3. **Type consistency:** `useCharacterSearch` API matches hook; apply-gate paths must be verified against real `src/components/*` names during Task 4.

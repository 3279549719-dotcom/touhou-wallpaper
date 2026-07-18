# Stage 2 Autofix MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions PR job that runs `tsc` + `vitest`, skips Cursor CLI when green, and when red runs an in-job Cursor CLI autofix/retest loop (max 3 attempts) with a single final push and outcome comment.

**Architecture:** New workflow `cursor-agent-autofix.yml` owns PR Agent usage. Stage-1 `cursor-agent-review.yml` is switched to `workflow_dispatch` only so green PRs never call CLI. Thin prompt at `.github/cursor-agent-autofix-prompt.md`; loop script at `.github/scripts/ci_autofix_loop.sh`. Mechanical tests remain the pass/fail oracle.

**Tech Stack:** GitHub Actions, Node 20, Cursor CLI (`agent`), bash, existing `CURSOR_API_KEY` secret.

**Spec:** [docs/superpowers/specs/2026-07-18-stage2-autofix-mvp-design.md](../specs/2026-07-18-stage2-autofix-mvp-design.md)

## Global Constraints

- Mechanical oracle: `npx tsc -b --noEmit` and `npx vitest run` only (no full `verify_m*` in this job)
- Max Agent attempts: **N = 3**; call CLI **only when** either check is red
- Loop shape **A**: retest in-job; **no** push per attempt; at most **one** push at end if tree dirty
- Green path: **no** Cursor CLI; no Stage-1 review comment
- Agent must not edit `.github/workflows/**` to pass CI; no auto-Merge
- Same-repository PRs only (MVP)
- Thin prompt + thick context via root `AGENTS.md`
- Secrets never logged or committed
- Code/comments English; UI strings via CONTENT / `strings.ts` when touching copy

---

## File structure (locked)

| Path | Role |
|------|------|
| `.github/cursor-agent-autofix-prompt.md` | **Create** — thin autofix prompt |
| `.github/scripts/ci_autofix_loop.sh` | **Create** — green skip / red loop N=3 / exit codes |
| `.github/workflows/cursor-agent-autofix.yml` | **Create** — PR workflow |
| `.github/workflows/cursor-agent-review.yml` | **Modify** — `workflow_dispatch` only (disable auto Stage-1) |
| `AGENTS.md` | **Modify** — CI autofix limits + Done means |
| `docs/dev/AUTO_REVIEW_SETUP.md` | **Modify** — Stage 2 ops + validation PRs |
| `docs/dev/PROGRESS.md` | **Modify** — pulse |
| `docs/superpowers/specs/2026-07-18-stage2-autofix-mvp-design.md` | **Modify** — Status → Approved / Implementing |

---

### Task 0: Feature branch

**Files:** none (git only)

**Interfaces:**
- Consumes: clean `master`
- Produces: branch `ci/stage2-autofix-mvp`

- [ ] **Step 1: Create branch**

```bash
git fetch origin
git checkout master
git pull origin master
git checkout -b ci/stage2-autofix-mvp
```

- [ ] **Step 2: Confirm baseline**

```bash
npm test
npm run check
```

Expected: tests green; `Assertion Passed`.

---

### Task 1: Thin autofix prompt

**Files:**
- Create: `.github/cursor-agent-autofix-prompt.md`

**Interfaces:**
- Consumes: root `AGENTS.md`, `check-summary.txt`, `tsc.log`, `vitest.log` on disk
- Produces: file edits in the working tree (via CLI), no stdout contract required beyond CLI exit

- [ ] **Step 1: Write the prompt file** exactly:

```markdown
# Cursor Agent PR autofix (Stage 2 MVP)

You are fixing a failing pull request for touhou-wallpaper inside CI.

## Rules

- Read repository root `AGENTS.md` first (required). Open deeper docs only if needed.
- Make the **smallest** change so these commands succeed:
  - `npx tsc -b --noEmit`
  - `npx vitest run`
- Use `check-summary.txt`, `tsc.log`, and `vitest.log` as the failure evidence.
- **Do not** modify `.github/workflows/**` or disable/delete tests to force a pass.
- **Do not** git commit, git push, or Merge.
- Do not expand scope (no unrelated refactors).
- Code and comments: English only. UI copy via `docs/spec/CONTENT.md` / `src/lib/strings.ts` when needed.

## Done

When finished editing, stop. CI will re-run the mechanical checks.
```

- [ ] **Step 2: Commit**

```bash
git add .github/cursor-agent-autofix-prompt.md
git commit -m "ci: add thin Cursor autofix prompt for Stage 2"
```

---

### Task 2: In-job loop script

**Files:**
- Create: `.github/scripts/ci_autofix_loop.sh`

**Interfaces:**
- Consumes: env `CURSOR_API_KEY`, `MAX_ATTEMPTS` (default 3), Cursor `agent` on `PATH`
- Produces:
  - Exit `0` if mechanical checks green (initially or after fixes)
  - Exit `1` if still red after N attempts or CLI hard-fails
  - Writes `autofix-outcome.txt` with one line: `green-initial` | `fixed:<k>` | `gave-up:<k>` | `cli-error`
  - May modify the git working tree (Agent edits)

- [ ] **Step 1: Create directory and script**

Create `.github/scripts/ci_autofix_loop.sh` with executable bit in git (`git update-index --chmod=+x` after add if needed):

```bash
#!/usr/bin/env bash
# In-job mechanical check + optional Cursor autofix loop (N attempts).
set -euo pipefail

MAX_ATTEMPTS="${MAX_ATTEMPTS:-3}"
OUTCOME_FILE="${OUTCOME_FILE:-autofix-outcome.txt}"

strip_key() {
  CURSOR_API_KEY="$(printf '%s' "${CURSOR_API_KEY:-}" | tr -d '\r\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"
  export CURSOR_API_KEY
}

run_checks() {
  set +e
  npx tsc -b --noEmit > tsc.log 2>&1
  local tsc_code=$?
  npx vitest run --reporter=verbose > vitest.log 2>&1
  local vitest_code=$?
  set -e
  {
    echo "=== Mechanical Check Results ==="
    echo ""
    echo "[TypeScript] Exit: ${tsc_code}"
    tail -n 40 tsc.log 2>/dev/null || true
    echo ""
    echo "[Vitest] Exit: ${vitest_code}"
    tail -n 60 vitest.log 2>/dev/null || true
  } > check-summary.txt
  if [[ "${tsc_code}" -eq 0 && "${vitest_code}" -eq 0 ]]; then
    return 0
  fi
  return 1
}

run_agent_fix() {
  strip_key
  if [[ -z "${CURSOR_API_KEY}" ]]; then
    echo "CURSOR_API_KEY secret is missing" >&2
    echo "cli-error" > "${OUTCOME_FILE}"
    return 2
  fi
  local prompt
  prompt="$(cat .github/cursor-agent-autofix-prompt.md)"
  # --force: allow file edits (Stage 1 review used no --force).
  # --trust: non-interactive CI.
  agent -p --force --trust --output-format text "${prompt}" > agent-autofix.log 2>&1 || true
}

main() {
  export PATH="${HOME}/.local/bin:${PATH}"

  if run_checks; then
    echo "green-initial" > "${OUTCOME_FILE}"
    echo "Mechanical checks green; skipping Cursor CLI."
    exit 0
  fi

  local attempt=1
  while [[ "${attempt}" -le "${MAX_ATTEMPTS}" ]]; do
    echo "Autofix attempt ${attempt}/${MAX_ATTEMPTS}"
    if ! run_agent_fix; then
      if [[ "$(cat "${OUTCOME_FILE}" 2>/dev/null || true)" == "cli-error" ]]; then
        exit 1
      fi
    fi
    if run_checks; then
      echo "fixed:${attempt}" > "${OUTCOME_FILE}"
      echo "Mechanical checks green after attempt ${attempt}."
      exit 0
    fi
    attempt=$((attempt + 1))
  done

  echo "gave-up:${MAX_ATTEMPTS}" > "${OUTCOME_FILE}"
  echo "Still red after ${MAX_ATTEMPTS} autofix attempts."
  exit 1
}

main "$@"
```

- [ ] **Step 2: Make executable and smoke-syntax check**

```bash
git add --chmod=+x .github/scripts/ci_autofix_loop.sh
bash -n .github/scripts/ci_autofix_loop.sh
```

Expected: no syntax errors from `bash -n`.

- [ ] **Step 3: Commit**

```bash
git add .github/scripts/ci_autofix_loop.sh
git commit -m "ci: add in-job autofix loop script (N=3)"
```

---

### Task 3: Autofix workflow

**Files:**
- Create: `.github/workflows/cursor-agent-autofix.yml`

**Interfaces:**
- Consumes: `secrets.CURSOR_API_KEY`, `GITHUB_TOKEN`, PR head ref
- Produces: job success/failure; optional push; PR comment when autofix ran or gave up

- [ ] **Step 1: Write workflow** exactly:

```yaml
name: Cursor Agent Autofix

on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
    branches: [master]

jobs:
  autofix:
    # Same-repo PRs only (MVP). Forks skip autofix.
    if: github.event.pull_request.head.repo.full_name == github.repository
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write

    steps:
      - name: Checkout PR branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install npm dependencies
        run: npm ci

      - name: Install Cursor CLI
        run: |
          curl -fsSL https://cursor.com/install | bash
          echo "$HOME/.local/bin" >> "$GITHUB_PATH"
          export PATH="$HOME/.local/bin:$PATH"
          agent --version

      - name: Mechanical checks + optional autofix loop
        id: loop
        env:
          CURSOR_API_KEY: ${{ secrets.CURSOR_API_KEY }}
          MAX_ATTEMPTS: '3'
        run: |
          set +e
          bash .github/scripts/ci_autofix_loop.sh
          code=$?
          echo "EXIT=${code}" >> "$GITHUB_OUTPUT"
          if [[ -f autofix-outcome.txt ]]; then
            echo "OUTCOME=$(cat autofix-outcome.txt)" >> "$GITHUB_OUTPUT"
          else
            echo "OUTCOME=unknown" >> "$GITHUB_OUTPUT"
          fi
          exit 0

      - name: Commit and push fixes if any
        if: steps.loop.outputs.OUTCOME != 'green-initial' && steps.loop.outputs.OUTCOME != 'cli-error'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          if git diff --quiet && git diff --cached --quiet; then
            echo "No file changes to push."
            exit 0
          fi
          git add -A
          # Never commit workflow sabotage if Agent violated prompt (belt and suspenders).
          if git diff --cached --name-only | grep -q '^\.github/workflows/'; then
            echo "Refusing to commit workflow changes from autofix." >&2
            git reset HEAD -- .github/workflows || true
            git checkout -- .github/workflows 2>/dev/null || true
          fi
          if git diff --cached --quiet; then
            echo "Nothing left to commit after workflow guard."
            exit 0
          fi
          git commit -m "ci(autofix): apply Cursor Agent fixes"
          git push origin "HEAD:${{ github.head_ref }}"

      - name: Comment outcome on PR
        if: always() && steps.loop.outputs.OUTCOME != 'green-initial'
        uses: actions/github-script@v7
        env:
          LOOP_EXIT: ${{ steps.loop.outputs.EXIT }}
          OUTCOME: ${{ steps.loop.outputs.OUTCOME }}
        with:
          script: |
            const fs = require('fs');
            const outcome = process.env.OUTCOME || 'unknown';
            const exitCode = process.env.LOOP_EXIT || '?';
            let logTail = '';
            try {
              const summary = fs.readFileSync('check-summary.txt', 'utf8');
              logTail = summary.split('\n').slice(-40).join('\n');
            } catch (_) {}

            let title = '## Cursor Autofix';
            let detail = '';
            if (outcome.startsWith('fixed:')) {
              title += ' — succeeded';
              detail = `Mechanical checks passed after **${outcome.split(':')[1]}** attempt(s).`;
            } else if (outcome.startsWith('gave-up:')) {
              title += ' — gave up';
              detail = `Still failing after **${outcome.split(':')[1]}** attempt(s). Human help needed.`;
            } else if (outcome === 'cli-error') {
              title += ' — CLI error';
              detail = 'Cursor CLI failed (check `CURSOR_API_KEY` / Actions log).';
            } else {
              title += ' — finished';
              detail = `Outcome: \`${outcome}\` (loop exit ${exitCode}).`;
            }

            const body = [
              title,
              '',
              detail,
              '',
              '<details><summary>Last check summary (tail)</summary>',
              '',
              '```',
              logTail || '(no summary)',
              '```',
              '',
              '</details>',
              '',
              '> Auto-generated by Stage 2 autofix. Human merge required.',
            ].join('\n');

            await github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body,
            });

      - name: Fail job if checks still red
        if: steps.loop.outputs.EXIT != '0'
        run: |
          echo "Autofix loop exit ${{ steps.loop.outputs.EXIT }} outcome=${{ steps.loop.outputs.OUTCOME }}"
          exit 1
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/cursor-agent-autofix.yml
git commit -m "ci: add Stage 2 Cursor autofix workflow"
```

---

### Task 4: Disable Stage-1 always-on review

**Files:**
- Modify: `.github/workflows/cursor-agent-review.yml`

**Interfaces:**
- Produces: Stage-1 no longer runs on PR events (manual `workflow_dispatch` only)

- [ ] **Step 1: Replace the `on:` block** at the top of `.github/workflows/cursor-agent-review.yml` with:

```yaml
name: Cursor Agent Review

# DISABLED on PR events — superseded by Stage 2 autofix (cursor-agent-autofix.yml).
# Keep for manual advisory review if needed.
on:
  workflow_dispatch:

jobs:
```

Keep the existing `jobs:` / steps body unchanged below.

Also add a one-line comment at the top of the file after `name:` if not already covered.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/cursor-agent-review.yml
git commit -m "ci: disable Stage-1 PR review autofire (Stage 2 owns Agent)"
```

---

### Task 5: AGENTS.md + setup docs + design status

**Files:**
- Modify: `AGENTS.md`
- Modify: `docs/dev/AUTO_REVIEW_SETUP.md`
- Modify: `docs/superpowers/specs/2026-07-18-stage2-autofix-mvp-design.md` (status line)
- Modify: `docs/dev/PROGRESS.md`

**Interfaces:**
- Produces: human/agent-readable ops for Stage 2

- [ ] **Step 1: Update `AGENTS.md`**

Replace the **Tests** CI bullet and **Done means** PR line, and add an **CI autofix** section:

Under Hard rules / after Tests section, ensure:

```markdown
## CI autofix (Stage 2)

- GitHub Action may call Cursor CLI **only when** `tsc` or `vitest` fails on a PR.
- Max **3** autofix attempts per job; then stop and comment.
- Autofix Agent must **not** edit `.github/workflows/**` or auto-Merge.
- Green mechanical checks: no Cursor CLI.

## Tests (who writes what)

- **Implementing Agent** writes automated tests on the **same feature branch** (Vitest for `lib`/logic; update `verify_*.py` when the module needs wiring checks). Not optional.
- **CI Autofix Agent** may patch the PR branch to make `tsc`/`vitest` green (capped). It does not replace feature tests the author should have written.
- **Patrick** does manual UI smoke only; he does not write automated tests.
- Ladder detail: [docs/dev/VERIFY.md](docs/dev/VERIFY.md).

## Done means

- Local / full gate: `npm test` + `npm run check`
- PR CI (Stage 2): `tsc` + `vitest`; autofix loop only if red; human merges
```

- [ ] **Step 2: Rewrite `docs/dev/AUTO_REVIEW_SETUP.md`** to describe Stage 2 as default:

```markdown
# touhou-wallpaper — Auto Review / Autofix Setup

> Last aligned: 2026-07-18 with Stage 2 design

## What runs on PRs (Stage 2 MVP)

Workflow: `.github/workflows/cursor-agent-autofix.yml`

1. Run `tsc` + `vitest`
2. If **green** → success (no Cursor CLI)
3. If **red** → Cursor CLI autofix + retest, up to **3** attempts (in-job)
4. Push fixes once if the tree changed; comment outcome
5. **Human Merges**

Stage 1 comment-only workflow is **manual only** (`workflow_dispatch` on `cursor-agent-review.yml`).

## Requirements

| Item | Status |
|------|--------|
| GitHub Secret `CURSOR_API_KEY` | Required |
| Autofix workflow | `.github/workflows/cursor-agent-autofix.yml` |
| Autofix prompt | `.github/cursor-agent-autofix-prompt.md` |
| Agent door | Root `AGENTS.md` |

## Validation

| PR | Expect |
|----|--------|
| Tiny green change | Job green; logs show skip CLI |
| Deliberate failing test (TDD) | Autofix ≤3 or give-up comment |

## Billing

CLI usage only when checks are red (or on failed retry runs). Mechanical checks alone do not use Cursor.
```

- [ ] **Step 3: Set design status** in `docs/superpowers/specs/2026-07-18-stage2-autofix-mvp-design.md`:

```markdown
> Status: Approved — implementation in progress
```

- [ ] **Step 4: Update `docs/dev/PROGRESS.md`** pulse to Stage 2 implementing; point at this plan.

- [ ] **Step 5: Commit**

```bash
git add AGENTS.md docs/dev/AUTO_REVIEW_SETUP.md docs/superpowers/specs/2026-07-18-stage2-autofix-mvp-design.md docs/dev/PROGRESS.md
git commit -m "docs: Stage 2 autofix ops and AGENTS CI limits"
```

---

### Task 6: Ship CI branch PR + validation PRs

**Files:** none required beyond git/GitHub

**Interfaces:**
- Produces: PR with workflow on `master` path; then two validation PRs

- [ ] **Step 1: Push and open implementation PR**

```bash
git push -u origin HEAD
```

Open PR titled `ci: Stage 2 Cursor autofix MVP (red-only, N=3)` against `master`.  
Expect: on this PR, if the branch itself is green, autofix job should **skip CLI**.

- [ ] **Step 2: After merge to master — Green validation PR**

Branch `ci/autofix-validate-green`:

```bash
git checkout master && git pull
git checkout -b ci/autofix-validate-green
```

Make a tiny docs-only or comment-only harmless change (e.g. one line in `README` “Autofix validated green path”).  
PR → confirm Actions log: `Mechanical checks green; skipping Cursor CLI.`

- [ ] **Step 3: Red TDD validation PR**

Branch `ci/autofix-validate-red`:

Add a deliberately failing unit test that is **easy** for the Agent to fix, e.g. in `src/__tests__/autofix_smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("autofix smoke", () => {
  it("expects 2+2", () => {
    // Deliberate fail for Stage 2 validation — Agent should fix expectation or expression.
    expect(2 + 2).toBe(5);
  });
});
```

Open PR **without** fixing it. Expect: red → CLI attempts → either green with bot commit `ci(autofix): apply Cursor Agent fixes` or give-up comment after 3.

- [ ] **Step 4: Close validation**

- Merge or close validation PRs as Patrick prefers  
- Update `PROGRESS.md`: Stage 2 `[x]` if both validation outcomes match the table  
- Commit/push that pulse update on master or via a tiny docs PR

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| New autofix workflow | 3 |
| Thin autofix prompt | 1 |
| In-job loop N=3, red-only | 2, 3 |
| Single final push + workflow guard | 3 |
| Disable Stage-1 PR autofire | 4 |
| AGENTS / AUTO_REVIEW_SETUP | 5 |
| Green + red validation PRs | 6 |
| No auto-Merge / no workflow sabotage | 1, 2, 3 |
| Same-repo only | 3 (`if:` on job) |

## Placeholder scan

No TBD steps. CLI invocation locked to `agent -p --force --trust` (edit-capable). If install script’s `agent` rejects `--force`, implementer must check `agent --help` once and adjust **only** the flag set in `ci_autofix_loop.sh`, keeping prompt/rules unchanged.

## Type / name consistency

- Outcome tokens: `green-initial` | `fixed:<k>` | `gave-up:<k>` | `cli-error`
- Workflow outputs: `EXIT`, `OUTCOME`
- Prompt path: `.github/cursor-agent-autofix-prompt.md`
- Script path: `.github/scripts/ci_autofix_loop.sh`

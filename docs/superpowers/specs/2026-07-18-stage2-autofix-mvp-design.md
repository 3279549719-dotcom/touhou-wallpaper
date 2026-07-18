# Design: Stage 2 Autofix MVP (in-job loop, N=3)

> Date: 2026-07-18  
> Status: Draft for Patrick review  
> Project: touhou-wallpaper  
> Audience: Patrick (non-programmer owner) + implementing agent  
> Related: [2026-07-17-auto-review-ci-design.md](./2026-07-17-auto-review-ci-design.md) (Stage 1: comment-only)

---

## 1. Problem

Stage 1 Auto Review runs `tsc` + `vitest` and posts an English comment, but **does not fix** red checks. Patrick wants a **minimal GitHub Actions loop**: on each PR to `master`, run mechanical tests; if green, stop; if red, call Cursor CLI (babysit-style thin prompt) to fix code in-job up to **3** attempts, then push once (or report failure). Human still Merges.

This is **not** embedding the IDE `babysit` skill file into Actions. It **reuses the babysit idea** (triage failures → scoped fixes → re-test) via Cursor CLI inside CI.

---

## 2. Goals and non-goals

### Goals (MVP)

- Trigger on PR `opened` / `synchronize` / `ready_for_review` targeting `master`
- Mechanical oracle: **`npx tsc -b --noEmit`** and **`npx vitest run`** (same as Stage 1)
- **If both green:** job succeeds; **no Cursor CLI** (Patrick choice A — MVP minimal)
- **If either red:** in-job autofix loop, max **N = 3** Agent attempts
- Loop shape **A:** fix and re-test **inside the same job** without intermediate pushes; **one** git push to the PR head at the end if the tree changed and (preferably) tests are green — or push best effort + comment if still red after N
- Thin prompt + thick context: short prompt file; Agent reads root `AGENTS.md` then deeper docs on demand
- Agent may edit application code; must **not** edit `.github/workflows/**` to make CI pass
- Post a short PR comment: success (fixed in k attempts) or gave up after 3
- `CURSOR_API_KEY` from GitHub Secrets; never commit secrets
- **Merge remains human-only**

### Non-goals (MVP)

- Auto-Merge
- Calling IDE babysit / Bugbot / Cloud Agents API as the engine
- Full `verify_m*` / `cargo` / Tauri E2E in this job
- Green-path English review comments (Stage 1 behavior can be disabled or left unused for this MVP)
- Portability template for other repos
- Formatters / ESLint gate (unless already required by `tsc`/`vitest`)

### Validation PRs (after implement)

| PR | Intent | Expected |
|----|--------|----------|
| Green | Tiny correct change | Mechanical pass → exit; **no** CLI |
| Red (TDD) | Deliberate failing test or type error, fixable | Red → CLI ≤3 → green → one push; or comment “gave up” |

---

## 3. Locked decisions

| Topic | Choice |
|-------|--------|
| Loop shape | **A** — in-job retest; no push-per-attempt |
| Max Agent attempts | **N = 3** |
| When to call Cursor CLI | **Only if mechanical tests red** |
| Green path | **End immediately** — no review comment job |
| Prompt style | Thin; babysit-inspired; door = root `AGENTS.md` |
| Engine | GitHub Actions + Cursor CLI (`agent` with write/trust as required for edits) |
| Merge | Human only |

---

## 4. Approaches considered

| Approach | Pros | Cons |
|----------|------|------|
| **1. New workflow `cursor-agent-autofix.yml` + pause Stage-1 always-CLI** (recommended) | Clear Stage 2 boundary; green path free; few files | Must turn off or gate Stage-1 to avoid double CLI cost |
| 2. Extend Stage-1 workflow only | One file | Tangled comment + fix logic; easy to keep calling CLI on green |
| 3. Push-per-attempt loop | Feels like human babysit | Trigger storms; harder MVP |

**Recommendation:** Approach **1**.

Stage-1 `cursor-agent-review.yml`: for MVP, **disable the Agent review step on green** by either (a) disabling the workflow file / job, or (b) changing it so CLI runs only when checks fail **without** autofix (redundant). Prefer **(a) disable Stage-1 Agent job** (or whole workflow) while Stage-2 autofix owns PR CI Agent usage; keep `test.yml` push CI if present. Exact toggle is an implementation detail — outcome: **green PRs never call Cursor CLI**.

---

## 5. Architecture

```text
PR → master
  │
  ▼
Checkout PR head (token that can push back)
  │
  ▼
npm ci
  │
  ▼
Run tsc + vitest ────────────────────────────┐
  │                                           │
  ├─ both exit 0 ──► success (no CLI) ───────┤
  │                                           │
  └─ either nonzero                           │
         │                                    │
         ▼                                    │
    attempt = 1..3                            │
         │                                    │
         ▼                                    │
    Cursor CLI (thin autofix prompt)          │
    · read AGENTS.md                          │
    · read check logs                         │
    · edit app code only                      │
         │                                    │
         ▼                                    │
    Re-run tsc + vitest                       │
         │                                    │
         ├─ green ──► break loop              │
         └─ red & attempt < 3 ──► next        │
         └─ red & attempt = 3 ──► give up     │
  │                                           │
  ▼                                           │
If working tree dirty: commit + push once
  │
  ▼
PR comment (fixed / gave up / silent if already green)
```

### Permissions

| Permission | Why |
|------------|-----|
| `contents: write` | Commit + push fixes to PR branch |
| `pull-requests: write` | Outcome comment |
| Secret `CURSOR_API_KEY` | CLI auth |

Use `actions/checkout` with a token that can push to forks **only if** MVP is limited to same-repo PRs (Patrick’s repo). **MVP scope: same-repository PRs only** (no fork PR autofix).

### Anti-loop

- No push until loop ends → avoids `synchronize` retrigger storms mid-fix
- Final push may retrigger workflow once: second run should be **green → no CLI** (cheap)
- Optional: skip autofix if commit message contains `[autofix-skip]` or author is the bot after a give-up (YAGNI unless needed)

---

## 6. Thin prompt (autofix)

New file (name flexible): `.github/cursor-agent-autofix-prompt.md`

Intent (English, short):

1. Read root `AGENTS.md` (hard rules, layout). Open deeper docs only if needed.
2. You are fixing a red PR. Inputs: `tsc.log` / `vitest.log` (or combined summary).
3. Make the **smallest** change so `tsc` and `vitest` pass.
4. **Do not** modify `.github/workflows/**`, secrets, or disable tests.
5. Do not Merge. Do not expand scope (no refactors unrelated to the failure).
6. Code/comments English; UI strings via CONTENT / `strings.ts` when touching copy.

CLI flags: follow whatever Stage-1 uses for non-interactive run, plus whatever is required to **allow file edits** (Stage 1 used no `--force` for review-only; autofix **needs** edit capability — implementer must verify current `agent` CLI flags and document the exact invocation in the plan). Prefer `agent -p --trust` (or documented equivalent) over unbounded shell.

---

## 7. Hard limits (thin rule overlay)

Add a short bullet block to root `AGENTS.md` (or a 5-line project rule) when implementing:

- CI autofix Agent: max 3 attempts per job; only when `tsc`/`vitest` fail
- Must not edit `.github/workflows/**` to pass CI
- Must not auto-Merge
- Prefer fixing product code / tests that the PR broke

---

## 8. Error handling / outcomes

| Outcome | Job result | PR comment |
|---------|------------|------------|
| Green on first mechanical run | Success | Optional one-liner or silence (MVP: silence or minimal “checks green, no autofix”) |
| Became green after k≤3 fixes | Success after push | “Autofix succeeded in k attempt(s)” |
| Still red after 3 | Failure (so branch protection can block Merge) | “Autofix gave up after 3 attempts” + last log tail |
| CLI/auth error | Failure | Comment with secret-missing / CLI error (no key values) |

---

## 9. Files to touch (implementation preview)

| Path | Action |
|------|--------|
| `.github/workflows/cursor-agent-autofix.yml` | **Create** — Stage 2 job |
| `.github/cursor-agent-autofix-prompt.md` | **Create** — thin prompt |
| `.github/workflows/cursor-agent-review.yml` | **Disable or gate** so green PRs do not call CLI |
| `AGENTS.md` | Short autofix limits + update “Done means” CI description |
| `docs/dev/AUTO_REVIEW_SETUP.md` | Document Stage 2 MVP + validation PRs |
| `docs/dev/PROGRESS.md` | Pulse |

---

## 10. Relationship to Stage 1

| Stage 1 (shipped) | Stage 2 MVP (this design) |
|-------------------|---------------------------|
| Always ran Agent comment | Agent only when red |
| No file edits | File edits + in-job retest |
| Advisory comment | Autofix + outcome comment |
| Still valuable as history | Supersedes green-path Agent usage for cost |

Stage 1 design remains the historical record; operational default becomes Stage 2 MVP once implemented and validated.

---

## 11. Success criteria

1. Green validation PR: Actions green; **no** Cursor CLI usage (or clearly skipped in logs)
2. Red TDD validation PR: becomes green within ≤3 attempts **or** explicit give-up comment; no workflow file sabotage
3. `CURSOR_API_KEY` never appears in logs/commits
4. Patrick Merges only by hand

---

## 12. Approval record

- Loop A, N=3, red-only CLI: locked in brainstorming (2026-07-18)
- Green path: **no** Stage-1-style review comment (Patrick A)
- Validation: one green PR + one deliberate red TDD PR
- Patrick to review **this file** before `writing-plans` / implementation

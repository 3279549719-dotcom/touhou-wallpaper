# Design: Auto Review CI (Cursor Agent + GitHub Actions)

> Date: 2026-07-17  
> Status: Draft for user review  
> Project: touhou-wallpaper  
> Audience: Patrick (non-programmer owner) + implementing agent

---

## 1. Problem

Manual review does not scale, and mechanical CI alone cannot catch architecture or hard-rule violations. Patrick wants an **AI-assisted review loop** that:

1. Runs cheap machine checks on every PR
2. Asks Cursor Agent (via CLI + API key) to read project rules and the PR diff
3. Posts an English review comment on the PR
4. Leaves **Merge** to a human

Long-term goal (out of MVP): a portable pattern (workflow + thin `AGENTS.md` + test layers) that can be copied to other personal projects. **This design only ships MVP for touhou-wallpaper.**

---

## 2. Goals and non-goals

### Goals (MVP)

- On PR open / sync / ready_for_review against `master`:
  - Run `tsc` + `vitest`
  - Always continue to Agent review even if checks fail
  - Post one English structured PR comment
- Thin **root** `AGENTS.md` as the single agent entry (door)
- Short Agent prompt: “read `AGENTS.md` → diff → optional deeper docs → report; do not edit files”
- `CURSOR_API_KEY` already in GitHub Secrets; never commit secrets
- Only Patrick may Merge

### Non-goals (MVP)

- Auto-fix, auto-commit, auto-push, auto-Merge
- Bugbot / Cursor Automations product path
- Cloud Agents REST API orchestration
- Full `verify_m*` suite and `cargo check` in this workflow
- E2E / UI automation for Tauri
- Extracting a reusable multi-repo template or component library
- Chinese review body (English by design; human can ask for a Chinese summary in chat)

### Later (explicitly staged)

| Stage | What | Trigger to start |
|-------|------|------------------|
| MVP | Machine checks + AI comment only | This design approved + implemented |
| Stage 2 | Limited autofix push to **same PR branch** (cap attempts) | MVP proven useful; Patrick asks |
| Stage 3 | Encode recurring findings into permanent tests/rules | After several real reviews |
| Stage 4 | Optional portability checklist / copy to other repos | After Stage 2–3 stable |
| Optional | Revisit Bugbot / Automations if CLI path is too heavy | Cost/UX comparison later |

---

## 3. Decisions already locked

| Topic | Choice |
|-------|--------|
| Engine | GitHub Actions + Cursor CLI (`agent -p`), not Bugbot/Automations/API-first |
| Agent entry files | **One** root `AGENTS.md`; `docs/dev/AGENTS.md` becomes a one-line redirect |
| Prompt style | Thin prompt + thick repo docs (Thariq / Boris alignment) |
| Required reads each review | Root `AGENTS.md` + PR diff; deeper docs **on demand** |
| Mechanical checks | `tsc` + `vitest` only |
| Success for “works” | English review comment appears (checks may be red) |
| Autofix | Not in MVP; Stage 2 later |
| Merge | Human only |
| Portability | Defer |
| Cost posture | Ship first, then tighten usage |
| Branching for first try | Small dedicated PR preferred (keep Zustand PR #10 clean) |

---

## 4. Architecture

```text
PR event (opened | synchronize | ready_for_review) → master
        │
        ▼
┌───────────────────────────────┐
│ Job: cursor-agent-review      │
│ 1. checkout (fetch-depth 0)   │
│ 2. setup Node 20 + npm ci     │
│ 3. tsc -b --noEmit            │  continue-on-error
│ 4. vitest run                 │  continue-on-error
│ 5. write check-summary.txt    │
│ 6. install Cursor CLI         │
│ 7. agent -p (no --force)      │  CURSOR_API_KEY
│ 8. post PR comment            │  pull-requests: write
└───────────────────────────────┘
```

### Components

| Unit | Responsibility | Depends on |
|------|----------------|------------|
| `test.yml` (existing) | Push-triggered mechanical CI (keep as-is or lightly aligned) | Node |
| `cursor-agent-review.yml` | PR review path: checks + Agent + comment | Secrets, Node, Cursor CLI |
| Root `AGENTS.md` | Door: what project is, hard rules, where to read, how “done” is proven | Links to `docs/dev/*` |
| Short prompt (inline in workflow) | Instruct Agent what to do this run | `AGENTS.md`, diff, `check-summary.txt` |
| PR comment | Human-visible English report | `agent-report.md` + check exits |

### Data flow

1. Machine writes exit codes + log tails → `check-summary.txt`
2. Agent reads door + diff (+ optional docs) + summary → `agent-report.md`
3. `actions/github-script` (or `gh`) posts combined comment

### Billing note (for owner)

CLI usage with `CURSOR_API_KEY` consumes Cursor usage (same family as chat/agent). Mechanical `tsc`/`vitest` do not. Bugbot/Automations are **not** used in MVP.

---

## 5. Root `AGENTS.md` content (target shape)

Keep **thin** (roughly 15–40 lines). Must include:

1. One-sentence project identity (Touhou Wallpaper, Tauri desktop app)
2. **Start here**: `docs/dev/PROGRESS.md` first; then open ARCHITECTURE / TECH_DESIGN / PRD / VERIFY only if needed
3. **Hard rules** (from current project constraints): English code/comments; UI copy from CONTENT; wallpaper/file IO in Rust; only Apply may `set_wallpaper`; do not commit `assets/images/`; no pay/login/cloud image CDN requirements as already documented
4. **Done means**: local/CI verification command(s) — prefer pointing at `npm run check` for humans; note that PR Agent workflow MVP runs `tsc` + `vitest`
5. Optional: 3–5 naming/layering bullets max (not a full style guide)

`docs/dev/AGENTS.md` → single line pointing to root `AGENTS.md`.

Do **not** duplicate full architecture or tech stack into `AGENTS.md`.

---

## 6. Agent prompt (MVP)

Inline in the workflow (or a small checked-in file under `.github/` if easier to edit). Requirements:

- Language of **output report**: English
- **Do not** modify files, commit, or push
- Steps:
  1. Read root `AGENTS.md`
  2. Inspect `git diff` vs `master` (or merge-base)
  3. Read `check-summary.txt`
  4. Open deeper docs only if needed to judge a hard-rule or architecture issue
  5. Write report to `agent-report.md` in the fixed format below

### Report format (English)

```markdown
## Checks
| Check | Result |
|-------|--------|
| TypeScript (tsc) | OK / FAIL |
| Vitest | OK / FAIL |

## Blocking
(none or bullet list with path + brief fix hint)

## Hard-rule / architecture risks
(none or bullets)

## Suggestions
(at most ~5 bullets: readability, error handling, obvious perf)

## Test gaps
(none or brief)
```

---

## 7. Workflow changes vs current draft

Existing untracked `.github/workflows/cursor-agent-review.yml` is a good base. MVP deltas:

| Item | Current draft | MVP target |
|------|---------------|------------|
| Python verify M0 | Yes | **Remove** from this job |
| `cargo check` | Yes | **Remove** from this job |
| Rust/Python setup | Yes | **Remove** unless needed later |
| Prompt language | Chinese report | **English** report |
| Prompt doc list | Forces AGENTS + TROUBLESHOOTING + VERIFY + ARCHITECTURE | **Root AGENTS.md required**; others on demand |
| `--force` | Not used (good) | Keep **no** `--force` |
| `test.yml` | PR trigger removed | Keep push-oriented; avoid duplicate PR noise |

Optional later: re-add `cargo check` / `verify_m*` once MVP is stable.

---

## 8. Implementation phases (iterate in order)

### Phase 0 — Spec acceptance

- [ ] Patrick approves this design doc
- [ ] Implementation plan written (`writing-plans`)
- [ ] No code until plan exists

### Phase 1 — Docs door

- [ ] Merge content into root `AGENTS.md` (thin)
- [ ] Replace `docs/dev/AGENTS.md` with redirect
- [ ] Update `AUTO_REVIEW_SETUP.md` / `PROGRESS.md` to match MVP (no Bugbot; tsc+vitest; English)

### Phase 2 — Workflow MVP

- [ ] Slim `cursor-agent-review.yml` to match §4–§7
- [ ] Ensure Secret name remains `CURSOR_API_KEY`
- [ ] Permissions: `contents: read`, `pull-requests: write`

### Phase 3 — First real PR trial

- [ ] Open a **small dedicated PR** (workflow + AGENTS only) against `master`
- [ ] Confirm Actions run and PR comment appears
- [ ] If Agent/CLI fails: fix install PATH, auth, or timeout; retry once; then search known Cursor CLI CI issues

### Phase 4 — Tune

- [ ] Shorten or clarify prompt if comments are noisy/useless
- [ ] Watch Cursor usage dashboard; tighten if needed
- [ ] Patrick decides whether Stage 2 autofix is worth it

### Phase 5 — Stage 2 (only if requested)

- [ ] Separate design/plan: `--force` + push to PR head with attempt cap
- [ ] Still no auto-Merge

---

## 9. Error handling

| Failure | Behavior |
|---------|----------|
| `tsc` / `vitest` fail | Record in summary; **still** run Agent; comment shows FAIL |
| Cursor CLI install/auth fail | Comment with short failure note + link to Actions log; job can fail |
| Agent produces empty report | Post fallback “Agent report generation failed” |
| Missing `CURSOR_API_KEY` | Fail Agent step clearly in log |
| Fork PRs | Out of scope; same-repo PRs only for MVP |

---

## 10. Testing / verification

Human-visible acceptance (MVP):

1. Dedicated PR includes workflow + root `AGENTS.md`
2. Actions tab shows job run
3. PR has an English review comment with Checks table
4. No commits authored by the Agent on that PR
5. Merge still requires Patrick

Optional local smoke (implementer): dry-run prompt text review; do not print secrets.

---

## 11. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Agent false positives | Treat comment as advisory; machine checks are source of truth for “green” |
| Usage cost | MVP reads only door + diff; Stage later; watch dashboard |
| CLI flaky in CI | Phase 3 retry; pin install docs; keep mechanical path useful alone |
| Duplicate docs drift | Single root `AGENTS.md`; redirect old path |
| Mixing with Zustand PR #10 | Prefer separate CI PR |

---

## 12. Relationship to prior notes

- `docs/dev/AUTO_REVIEW_SETUP.md` recorded an earlier broader check set (verify + cargo) and Chinese reports. **This design supersedes that for MVP.** Update that doc in Phase 1 so it does not contradict.
- Secret `CURSOR_API_KEY` is already configured on GitHub.
- Philosophical refs: encode knowledge in repo docs (Boris); thin prompts / thick artifacts (Thariq).

---

## 13. Open items (none blocking MVP)

- Exact Cursor CLI install line on `ubuntu-latest` (follow current Cursor headless docs at implement time)
- Whether `test.yml` should eventually share a composite action with the review job (YAGNI until duplication hurts)

---

## Spec self-review (2026-07-17)

- Placeholders: none intentional; CLI install left “follow current docs” by design
- Consistency: MVP checks = tsc+vitest only; English report; no autofix; one root AGENTS
- Scope: single MVP path for this repo; portability deferred
- Ambiguity: “small dedicated PR” chosen over hitchhiking #10

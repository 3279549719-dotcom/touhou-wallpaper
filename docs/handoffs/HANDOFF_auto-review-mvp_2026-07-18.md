# Handoff: Auto Review MVP (2026-07-18)

## For next agent (read first)

This session shipped and verified the **Cursor Agent PR review MVP** on branch `ci/auto-review-mvp` as **PR #11** (still open — human should Merge). Mechanical CI + CLI review + English PR comments work after syncing a valid `CURSOR_API_KEY` into GitHub Secrets. Do **not** re-debug the invalid-key issue unless a new failure appears. Next work is either Merge #11, optional polish from Agent suggestions, or a new design for Stage 2 autofix — ask Patrick which.

**Start here (map):** root [AGENTS.md](../../AGENTS.md) → [docs/dev/PROGRESS.md](../dev/PROGRESS.md) → this handoff → design/spec below only if needed.

---

## Done this session

- Design locked and committed: [docs/superpowers/specs/2026-07-17-auto-review-ci-design.md](../superpowers/specs/2026-07-17-auto-review-ci-design.md)
- Thin root door [AGENTS.md](../../AGENTS.md); [docs/dev/AGENTS.md](../dev/AGENTS.md) is a one-line redirect
- Workflow: [.github/workflows/cursor-agent-review.yml](../../.github/workflows/cursor-agent-review.yml) — `tsc` + `vitest` (continue on fail) → Cursor CLI (`agent -p --trust`, no `--force`) → English PR comment
- Prompt: [.github/cursor-agent-review-prompt.md](../../.github/cursor-agent-review-prompt.md)
- Setup note: [docs/dev/AUTO_REVIEW_SETUP.md](../dev/AUTO_REVIEW_SETUP.md)
- PR: https://github.com/3279549719-dotcom/touhou-wallpaper/pull/11 — latest Agent review comment OK (Checks OK, Blocking none, useful Suggestions)
- Fixed root cause of `API key is invalid`: GitHub Secret was stale; synced from local `.env` valid key (`cursor 2`). Debug instrumentation removed (`c2e0e89`)
- Zustand favorites already on `master` via PR #10 (before this CI branch)

---

## Decisions made

- Engine: **GitHub Actions + Cursor CLI**, not Bugbot / Automations / Cloud Agents API (for now)
- MVP: **review + comment only**; no autofix / auto-push / auto-Merge
- One root `AGENTS.md`; thin prompt; deeper docs on demand
- Mechanical checks in Agent job: **`tsc` + `vitest` only** (not full `verify_m*` / cargo)
- Report language: **English**
- Portability to other repos: **deferred**
- Stage 2 limited autofix: **only after Patrick asks** (new design first)

---

## Disk evidence

| Proof | Where |
|-------|--------|
| Design | `docs/superpowers/specs/2026-07-17-auto-review-ci-design.md` |
| Branch tip | `ci/auto-review-mvp` @ `c2e0e89` |
| Open PR | https://github.com/3279549719-dotcom/touhou-wallpaper/pull/11 |
| Successful Actions run | Cursor Agent Review run after secret sync (conclusion success; English comment on PR) |
| Secret name | GitHub Actions secret **`CURSOR_API_KEY`** (value never in git) |
| Pulse | `docs/dev/PROGRESS.md` |

---

## Not done / blocked

- **PR #11 not merged yet** — waiting on Patrick
- Optional polish from Agent comments (not blocking MVP): drop duplicate Checks table in PR comment body; pin Cursor CLI install; update-one-comment instead of new comment every `synchronize`; `FORCE_COLOR=0` for vitest logs; README link to root `AGENTS.md`
- No business-code PR re-test yet (optional confidence round)
- Stage 2 autofix: not started
- Do not commit `.env`; do not paste API keys into chat or docs

---

## Next steps (ordered)

1. Patrick **Merge PR #11** (or ask agent to merge if he explicitly requests).
2. After merge: confirm `master` has workflow + root `AGENTS.md`; open any new PR and expect Agent comment.
3. Optional: small polish commit from Agent suggestions (duplicate table / draft skip / single comment).
4. Optional: one tiny **app-code** PR to see review quality on real diffs.
5. Only if requested: brainstorm **Stage 2** limited autofix (`--force` + push to PR head + attempt cap).

---

## Suggested skills

- `brainstorming` — before Stage 2 autofix or major CI redesign
- `executing-plans` / `writing-plans` — after a Stage 2 design is approved
- `finishing-a-development-branch` — when closing out `ci/auto-review-mvp` after merge
- `using-superpowers` — new chat orientation; still prefer PROGRESS + this handoff first

---

## Sensitive data

- **Redacted:** Cursor API key and GitHub token values (live only in local `.env` / GitHub Secrets)
- Secret name for CI: `CURSOR_API_KEY`
- If Agent review fails again with “API key is invalid”: compare Dashboard key with GitHub Secret (do not re-paste keys into chat)

---

## Quick map (where to read what)

| Want | Open |
|------|------|
| Current pulse / Next prompt | [docs/dev/PROGRESS.md](../dev/PROGRESS.md) |
| Agent door + hard rules | [AGENTS.md](../../AGENTS.md) |
| Auto-review design (MVP scope) | [docs/superpowers/specs/2026-07-17-auto-review-ci-design.md](../superpowers/specs/2026-07-17-auto-review-ci-design.md) |
| Human how-to for this CI | [docs/dev/AUTO_REVIEW_SETUP.md](../dev/AUTO_REVIEW_SETUP.md) |
| Architecture / verify / PRD | Only if task needs — see links inside root `AGENTS.md` |
| This handoff | `docs/handoffs/HANDOFF_auto-review-mvp_2026-07-18.md` |

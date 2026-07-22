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

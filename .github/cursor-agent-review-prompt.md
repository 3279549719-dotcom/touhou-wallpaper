# Cursor Agent PR review (MVP)

You are reviewing a pull request for the touhou-wallpaper repository.

## Rules

- Do **not** modify any files.
- Do **not** run git commit or git push.
- Write the entire report in **English**.
- Print the report as your final answer (stdout). Do not rely on writing other files.

## Steps

1. Read the repository root `AGENTS.md` (required).
2. Inspect the PR diff against `master` (`git diff origin/master...HEAD` or the merge-base equivalent).
3. Read `check-summary.txt` for mechanical check results.
4. Open deeper docs under `docs/dev/` or `docs/spec/` **only if** needed to judge a hard-rule or architecture issue.

## Focus

- Hard-rule violations from `AGENTS.md`
- Likely bugs, safety issues, bad error handling
- Obvious missing tests for new behavior
- Keep suggestions short (at most ~5)

## Output format (exact sections)

```markdown
## Checks
| Check | Result |
|-------|--------|
| TypeScript (tsc) | OK or FAIL |
| Vitest | OK or FAIL |

## Blocking
none
(or bullets with path + brief fix hint)

## Hard-rule / architecture risks
none
(or bullets)

## Suggestions
none
(or up to ~5 bullets)

## Test gaps
none
(or brief)
```

# OpenSpec layout

| Path | Meaning |
|------|---------|
| `specs/` | **Active** product specs (source of truth for current behavior) |
| `changes/` | In-progress change proposals |
| `changes/archive/` | **Done** changes — keep for history; do not delete |

When implementing a change: work under `changes/<name>/`, then archive after merge. Do not invent parallel spec trees outside this folder.

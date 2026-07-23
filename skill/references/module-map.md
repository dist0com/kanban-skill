# The module map

Write and repair `docs/kanban/modules.md` — a plain list of the project's modules.

A module is anything maintained in the codebase that grows independently. Judged by
meaning, not by folder; a handful of lines, not one per folder. (Not a track: a track
is a kind of effort, a module is a part of the product — a task has both.)

## Example

A repo with `server/`, `packages/core/`, `web/`, `cli/`, and `docs/` might map to:

```
If a line here disagrees with the repo you just read, fix the line.

- **api** — the backend server and its shared core. `server/`, `packages/core/`.
- **web-app** — the browser app users sign into. `web/`.
- **cli** — the command-line client. `cli/`.
- **docs** — the public documentation site. `docs/`.
```

Five folders, four modules — the server and its core always change together, so they
are one line.

## Repair

Whoever reads the map and sees it disagree with the repo fixes it in the same run: add
the missing line, delete or rename the dead one, fix a stale path. If the user says the
map is wrong, rebuild from scratch.

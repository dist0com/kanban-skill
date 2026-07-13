# Memory

Short notes carried to the next planning loop, from the user's standpoint. Watermarks say
when a source was last reviewed, so the next loop knows what changed.

## Watermarks

- skill files (`skill/`, `.claude/skills/kanban/`) — reviewed 2026-07-10.
- `README.md`, `docs/guides/` — reviewed 2026-07-10.
- `PUBLISHING.md` — reviewed 2026-07-10.

## Product direction

- The skill is a reusable, project-agnostic port of dist0's kanban skill. Configuration
  makes it fit any repo; presets carry the opinionated extras.
- Stay file-based and git-diffable. No database, no server.

## Open gaps

- Setup still hand-creates the board folders (#4 would add an `init` command).
- Not yet on any marketplace (#1, #2).
- Guides lack a worked, end-to-end example (#3).

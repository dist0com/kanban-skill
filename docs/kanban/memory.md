# Memory

Short notes carried to the next planning loop, from the user's standpoint. Watermarks say
when a source was last reviewed, so the next loop knows what changed.

## Watermarks

- skill files (`skill/`, `.claude/skills/kanban/`) — reviewed 2026-07-10.
- `README.md`, `docs/guides/` — reviewed 2026-07-10.
- `PUBLISHING.md` — reviewed 2026-07-10.
- local UI (`kanban-ui/`) — reviewed 2026-07-21.

## Last focus

- 2026-07-21: local board UI, "the board as a pick-your-next-task surface". Proposed
  #24 (sort each column by pick-order not id), #25 (show which cards you can't start
  yet), #26 (ready-only focus toggle). Next loop: rotate off the local UI.

## Product direction

- The skill is a reusable, project-agnostic port of dist0's kanban skill. Configuration
  makes it fit any repo; presets carry the opinionated extras.
- Stay file-based and git-diffable. No database, no server.

## Open gaps

- Plugin is installable + submitted to the community marketplace (pending review), and
  skills.sh auto-submitted the public repo (listing pending). Still no second marketplace (#2).
- Guides lack a worked, end-to-end example (#3).
- Opening the board to pick the next task, cards sort by id only — a high-priority
  `ready` card hides under old ones; blocked/open-question cards look startable; no way
  to narrow to just what's ready. Covered by #24/#25/#26.

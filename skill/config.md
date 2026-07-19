# Configuration

This file adapts the kanban skill to your project. The install step fills in the
`{{PLACEHOLDERS}}` below from your repo; until then, the default in each note applies.

`SKILL.md` reads these values — when it says "your tracks", "your planning sources", or
"your reference docs", it means what's set here.

**This is the only file that carries your project's settings.** Everything else in this
folder (`SKILL.md`, `kanban.mjs`, `references/`) is generic and owned by upstream, so an
update overwrites those wholesale and leaves this file untouched. See "Updating the skill"
in `SKILL.md`.

- **Project** — {{PROJECT_NAME}}: {{PROJECT_GOAL}}
  _(default: this repository; its goal is whatever the README states.)_
- **Tracks** — the buckets a task can live in, with a rough share of effort:
  {{TRACKS}}
  _(default: `feature` 60%, `bug` 25%, `research` 15%. A track is just a folder
  under `docs/kanban/todo/`.)_
- **Planning sources** — what to read when proposing new work:
  {{PLANNING_SOURCES}}
  _(default: the codebase, `docs/`, and the board itself.)_
- **Reference docs** — optional files the skill reads when they exist. Leave blank
  if you don't have them:
  - roadmap / direction: {{ROADMAP_DOC}}
  - user-facing docs the work should keep in sync: {{DOCS_DIR}}
  - anything else worth scanning each loop: {{EXTRA_SOURCES}}
- **Preset** — an optional bundle of extra tracks and reviews for a specific kind of
  project: {{PRESET}}
  _(default: none. `references/presets/indie-hacker.md` adds growth / validation /
  building tracks, market-validation, and a moat test for a solo product launch.)_

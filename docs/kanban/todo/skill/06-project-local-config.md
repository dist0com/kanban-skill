---
title: Keep the board's config in the project, not in SKILL.md
track: skill
priority: high
roi: high
status: ready
blocked_by: []
related: [1]
questions: []
---

The config already moved out of `SKILL.md` into `config.md` — but that file still sits
inside the skill folder. That works when the skill is copied into the repo. It does not
work for a plugin install: the whole skill folder, `config.md` included, lands in a
shared read-only cache, so nobody can fill it in per project. Move the config into the
project, next to the board, so `/plugin install` plus `kanban init` gives a working
board with nothing to copy or edit in place.

## Plan

- The config lives at `docs/kanban/config.md`, next to the board. Same fields and same
  markdown shape as today's `config.md` (project, tracks, planning sources, reference
  docs, preset). `docs/kanban/ui.config.json` already set this precedent: per-project
  state lives with the board.
- `SKILL.md` tells the agent to read `docs/kanban/config.md`. If that file is missing
  but an old filled `.claude/skills/kanban/config.md` exists, move it into
  `docs/kanban/` once and continue. The skill folder ships no per-project file at all.
- `kanban init` writes a starter `docs/kanban/config.md` with the placeholder fields.
  On a board that already exists, init adds the file only if it's missing and never
  touches a filled one — today init no-ops on an existing board, so upgraders would
  never get the file.
- The skill's commands must also run from a read-only plugin cache: point at the
  script through the skill's base folder (the path the harness hands the agent), not a
  hard-coded `.claude/skills/kanban/` path. This applies to `SKILL.md` **and** the
  guides in `references/` — five of them spell out the hard-coded path today. The
  script only ever writes under `docs/kanban/`, so a read-only skill folder is fine.
- This makes updates simpler: with nothing per-project left in the skill folder, an
  update overwrites it wholesale. `references/update.md` drops its "skip config.md"
  and reconcile steps; a template change is picked up by comparing the starter config
  with the project's.

## Todo

- [ ] Move the config template so `kanban init` writes a starter `docs/kanban/config.md`
      (also on existing boards that lack one).
- [ ] `SKILL.md`: read `docs/kanban/config.md`; one-time move of a legacy filled
      skill-folder `config.md`.
- [ ] `SKILL.md` and every guide in `references/`: reference the script via the
      skill's base folder, no hard-coded `.claude/skills/kanban/` paths.
- [ ] `INSTALL_PROMPT.txt`: fill `docs/kanban/config.md` instead of a file in the
      skill folder.
- [ ] `references/update.md`: updates now overwrite the skill folder wholesale; keep
      only the new-field check against the project's config.
- [ ] README: say your config and your board both live in `docs/kanban/`, and that
      `/plugin install` + `kanban init` is the whole setup.

## Why now

The skill is installable as a plugin, but a bare plugin install leaves the board
unconfigured because the config is trapped in the read-only skill folder. This is the
fix that makes the plugin channel actually usable.

# Keep the board's config in the project, not in SKILL.md

**Track:** skill · **Priority:** high · **ROI:** high
**Blocked by:** none · **Related:** #1

Right now each project fills the Configuration block inside its own copy of `SKILL.md`.
That only works when the skill is copied into the repo. If someone installs the skill as a
plugin, `SKILL.md` lives in a shared, read-only cache — they can't fill it in per project,
so the board never gets configured. Move the config into a project file the skill reads, so
a plain `/plugin install` plus `kanban init` gives a working board with no file copying.

## Scope
- Pick where project config lives, e.g. `docs/kanban/config.md` (project name, tracks,
  planning sources, reference docs, preset).
- Make `SKILL.md` read config from that file instead of from its own Configuration block.
  Ship `SKILL.md` with no per-project values to fill in.
- Have `kanban init` write a starter `config.md` (and keep the board scaffold it already
  makes).
- Once this lands, a plugin install needs no in-place edit: install, run `kanban init`,
  done. Update the install docs and drop the "edit SKILL.md in place" step.

## Todo
- [ ] Decide the config file's location and shape (one file, plain fields).
- [ ] Move the Configuration block content into that file; leave `SKILL.md` reading from it.
- [ ] Make `kanban init` create a starter `config.md`.
- [ ] Update `INSTALL_PROMPT.txt`: fill `config.md` instead of editing `SKILL.md` in place.
- [ ] Update the README so `/plugin install` + `kanban init` is a real one-command-plus-setup path.

## Why now
Task #1 published the skill as a plugin, but a bare plugin install leaves the board
unconfigured because config is trapped in `SKILL.md`. This is the fix that makes the plugin
channel actually usable.

# Add an `init` command to kanban.mjs

**Track:** skill · **Priority:** med · **ROI:** high
**Blocked by:** none · **Related:** none

Setup still asks the user to hand-create the `docs/kanban/` folders and starter files.
An `init` command would scaffold the board in one step, so install is: copy the skill,
run `init`, fill the Configuration.

## Scope
- Add `node kanban.mjs init` that creates `docs/kanban/` with `todo/README.md`,
  `todo/blockers/`, the track folders, `next-id` (set to 1), and empty
  archive / rejected / redesign / memory files.
- Do nothing (and say so) if a board already exists, so it's safe to re-run.

## Todo
- [ ] Design what `init` writes and how it reads the configured track names.
- [ ] Implement `init` in `kanban.mjs` and add it to `help`.
- [ ] Update SKILL.md and the README install prompt to use `init`.
- [ ] Test on a fresh project folder.

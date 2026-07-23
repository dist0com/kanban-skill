---
title: Tag each task with the modules it touches
track: skill
priority: med
roi: high
status: todo
blocked_by: []
related: [31, 39]
questions: []
---

A track says what kind of effort a task is (`distribution`, `docs`). It does not
say what part of the product the task touches. Add a `modules:` field so a card
carries both.

This is also half of what keeps the map in #33 alive. The map has no clock and
no git check. This card covers additions: when someone tags a card with a module
that is not listed, the script rejects the name and the map gains a line. A new
module shows up the moment someone works on it. (Deletions and renames are the
other half — propose's cross-check, in #33.)

This card stays on the skill side: the `modules` field and the `kanban.mjs` work
that writes and validates it. Showing the field in the local UI (the board card
and the card page) is its own card, #39.

## Scope
- Add `modules: []` to a card's frontmatter. Optional, and a list — one task can
  touch two modules, and a distribution task may touch none.
- Add `--modules` to `create` and `update` in `kanban.mjs`.
- Validate each name against `docs/kanban/modules.md` (#33), the same way
  `--track` is validated against the track folders. Parse the bolded name at the
  front of each line and nothing else.
- An unknown name is a hard error. The message must list the known names and say
  to add a line to `modules.md` if this really is a new module — that message is
  the whole refresh mechanism, so it has to teach.
- Work when there is no map yet. Every install that already exists has none, so
  a missing `modules.md` means the field is skipped, not an error.
- Migrate the cards on the board today with a simple script. Don't guess which
  module each card touches — just add `modules: []` to every card that lacks the
  field. People tag them later as they work each card.
- Update the "Add a task" step in SKILL.md, where the main agent runs `create`.
  `references/add-task.md` does not change — that subagent only fills the body.
- Make `references/propose.md` list the cards already tagged with the focus
  module. A module with no cards is a gap worth a look.

## Todo
- [ ] Add the `modules` field to the frontmatter writer in kanban.mjs
- [ ] Add `--modules` to create and update, validated against modules.md
- [ ] Write the unknown-name error so it lists known names and says how to add one
- [ ] Skip the field cleanly when modules.md does not exist
- [ ] Write a simple migration script that adds `modules: []` to every card missing it
- [ ] Make propose list the cards tagged with the focus module
- [ ] Document the field in SKILL.md's "Add a task" step

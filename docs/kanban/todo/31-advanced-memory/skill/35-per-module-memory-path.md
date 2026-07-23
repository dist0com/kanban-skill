---
title: Give each module its own memory path
track: skill
priority: med
roi: high
status: todo
blocked_by: [33]
related: [31, 32, 33]
questions: []
---

Today every scan note lands in one shared memory (`memory.md`, or files under
`memory/`). One module's notes get buried under another's. Give each module its
own memory path, so each module grows its own memory on its own.

## Scope
- The path is keyed by the module's name — the bolded name in `modules.md` (#33),
  the one thing code reads from the map. So a module's memory lives at, e.g.,
  `docs/kanban/memory/<module>/`.
- A module with no notes yet has no folder. The path is made the first time
  something writes to it.
- The propose flow (#32) reads the memory of the focus module, not the whole
  board — so notes about the part you're working on are the ones you see.
- Fall back cleanly with no module map: keep one shared memory, same as today.
  Every install that already exists has no map.
- This card only lays down the per-module path. What files go inside it is #36.

## Todo
- [ ] Pick the per-module path layout, keyed by the module name from `modules.md`
- [ ] Make memory writers put a note under the focus module's path
- [ ] Make the propose flow read the focus module's memory
- [ ] Keep working with no module map — fall back to one shared memory
- [ ] Document the layout in SKILL.md's Layout list

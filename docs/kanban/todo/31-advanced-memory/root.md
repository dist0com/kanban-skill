---
title: "Advanced memory: a structured memory layer for planning"
track: skill
priority: high
roi: high
status: todo
blocked_by: []
related: []
questions:
  - Beyond a module map, what facts should the memory hold — project goals, users, code conventions, what shipped recently?
  - Should the scan notes stay in one memory.md, or split into one file per topic under docs/kanban/memory/? (The module map is out of this — it lives flat at docs/kanban/modules.md.)
---

The skill has no structured memory of the project. When an agent proposes tasks, it
re-reads the codebase and guesses — it doesn't even have a list of what modules the
project contains. Build a memory layer that holds real facts about the project, so
proposals come from knowledge instead of a fresh guess each time.

This is a group task. It tracks the memory work; each concrete piece is its own
subtask in this folder. The exploration (#32) will add more subtasks as we learn
what the memory should hold.

## Scope
- Today `docs/kanban/memory.md` only keeps short notes from past scans. Nothing
  records what the project is made of.
- Start with the one confirmed piece: a module map at `docs/kanban/modules.md`,
  written at setup (#33), plus a `modules:` field so each card says what it
  touches (#34). No clock and no git check keeps the map current: the field
  catches new modules (#34), and every reader fixes lines that no longer match
  the repo (#33).
- Explore what else belongs in memory and how the propose flow should read it (#32).

## Todo
- [ ] Explore what the memory layer should hold #32
- [ ] Map the project's modules at setup #33
- [ ] Tag each task with the modules it touches #34

---
title: "Advanced memory: a structured memory layer for planning"
track: skill
priority: high
roi: high
status: todo
blocked_by: []
related: []
modules: []
questions: []
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

## Decisions

- **What the memory holds beyond the module map.** Keep project goals, and nothing
  new past that. Each memory path gets a fixed five-file set (#36, #37): a current-status
  note (`readme.md`), a user-owned direction note (`goal.md` — the goals), settled
  question answers (`decisions.md`), and the `redesign.md` / `rejected.md` files the
  board already keeps. Target users and code conventions are
  out — they don't move the choice of next task enough to be worth maintaining.
  "What shipped recently" needs no new fact; the published doc records it (with
  `readme.md` as the holding pen until a doc exists) — see #37.
- **One shared memory or split.** Split, one memory per module, at
  `docs/kanban/memory/<module>/` (#35), each holding the same five-file set (#36, #37).
  Not one flat `memory.md`, and not one-file-per-topic — the module a card names
  (#34) picks which copy a write lands in, so a module's notes stay with that module.
  Umbrella-wide work reads the board-root copy of the set. The module map is not
  memory: it stays flat at `docs/kanban/modules.md`, since the script parses it and
  the prune flow would mangle it (#33).
- **How shipped work gets recorded — stop maintaining `archive.md`.** Recording what
  shipped is not the memory layer's job; the published doc is. Point the finish and
  prune flows at the doc (or `readme.md` until a doc exists) instead of `archive.md`.
  Done (#37): `archive.md` is gone from the set and the finish/prune flows now record
  to the doc / `readme.md`.

## Todo
- [ ] Explore what the memory layer should hold #32
- [x] Map the project's modules at setup #33
- [x] Tag each task with the modules it touches #34
- [x] Give each module its own memory path #35
- [x] Fill each module's memory with a fixed set of files #36
- [x] Stop maintaining `archive.md`: point the finish and prune flows at the published
  doc / `readme.md` #37

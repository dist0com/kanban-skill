---
title: Fill each module's memory with a fixed set of files
track: skill
priority: med
roi: high
status: ready
blocked_by: [35]
related: [31, 35]
questions: []
---

Each module's memory (#35) holds the same fixed set of files. The board root keeps
this same set for the whole project. The two sets sit side by side: the global set
covers the umbrella project, each module's set covers one module. Then propose, for a
focus module, reads that module's slice instead of the whole board.

## The file set (six files, same at both levels)
- `readme.md` (new) — current status: where this module (or the project) stands now.
- `goal.md` (new) — direction: where this module (or the project) is headed. One short
  statement, owned by the user.
- `decisions.md` (new) — settled answers to cards' open questions: the question and its
  answer, once resolved.
- `redesign.md` — design mistakes to avoid.
- `archive.md` — what shipped, in plain words.
- `rejected.md` — ideas we turned down, and why.

The last three already exist at the board root today. Each module gains its own copy
beside them; the board copies stay.

## Where each set lives
- Global (umbrella project): the board root, `docs/kanban/`.
- Per module: `docs/kanban/memory/<module>/` (#35).

The module copies sit beside the global ones — they never replace them.

## When the files are created
- Global set: written by `init`, alongside the files the board keeps today.
- Module set: created lazily, the whole set at once, the first time anything writes to
  that module's memory (#35's rule — a module with no notes has no folder). No
  pre-creation for every listed module.
- `readme.md` and `goal.md` start as short templates: `readme.md` a one-line "not
  written yet" placeholder the agent refreshes during a scan, `goal.md` a prompt line
  for the user to fill. The other four start empty and grow as their flow runs.

## How each file gets filled
Which copy a write lands in is picked by the card's `modules:` field (#34): a card that
names a module writes to that module's copy (both copies, if it names two); a card with
no module, or an umbrella-wide change, writes to the global copy.
- `decisions.md` — the resolve flow appends each question and its answer when it clears
  a card's `questions`.
- `redesign.md` — the "Record a redesign" step appends its entry.
- `archive.md` — the "Finish a task" step appends its line.
- `rejected.md` — the "Reject an idea" step appends its line.
- `readme.md` — the agent overwrites it with the current status during a scan.
- `goal.md` — the user edits it.

## How propose uses them
#35 already has propose read the focus module's memory. This card says what each file
answers there:
- `readme.md` → current status, `goal.md` → direction, `decisions.md` → settled answers
  so propose does not re-ask.
- `redesign.md`, `archive.md`, `rejected.md` → same use as today (avoid wrong designs,
  don't re-propose shipped or rejected work), from the module copy.
- Umbrella-wide work with no focus module reads the global set.

## Decisions
- **Beside, not instead.** The board and each module keep their own full set. Global
  copies cover the whole project; module copies cover one module.
- **Lazy creation.** A module's set is made on first write, all six files together, to
  match #35. Only the global set is written at `init`.
- **`goal.md` is user-owned.** The agent seeds a template but does not invent a
  module's direction; the user fills it. `readme.md`, being current status, the agent
  refreshes on its own.
- **New status file.** `readme.md` snapshots "where this stands", kept at both levels.

## Scope
- Depends on #35: the per-module path must exist first.
- Depends on #34: the `modules:` field picks which copy a write lands in.
- Keep the board-level redesign/archive/rejected as they are today; add a module copy
  beside each.
- Add `readme.md`, `goal.md`, and `decisions.md` at both levels.

## Todo
- [ ] Define the fixed six-file set for a memory path (readme, goal, decisions,
      redesign, archive, rejected)
- [ ] Create the global set at `init`; create a module's set lazily, all six at once,
      on the first write to that module's memory
- [ ] Seed `readme.md` and `goal.md` as short templates (readme a placeholder the agent
      refreshes, goal a prompt the user fills)
- [ ] Wire archive, reject, and record-redesign to also write the module copy picked by
      the card's `modules:` field
- [ ] Wire the resolve flow to append each resolved question and answer to the right
      `decisions.md`
- [ ] Say in propose how each file is used for the focus module (status, direction,
      settled answers), and read the global set for umbrella work
- [ ] Teach the prune flow about the new files and the module copies
- [ ] Document the file set in SKILL.md

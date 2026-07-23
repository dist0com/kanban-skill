# Propose new tasks

Pick a module, then propose **3 new tasks inside it**. New work, not picks from the
board — tasks in one focus close a gap; scattered ideas just skim the product.

## 1. Pick the module

Read `docs/kanban/modules.md` and repair any line that
disagrees with the repo (no map? build it per `references/module-map.md`).

**Ask the user to pick one or more modules from the map.** If they leave it open, pick
one yourself — the one where `memory.md` says users stumble most.

## 2. Walk it as a user

Ideas come from a walkthrough, not a feature list. Play one real user story in the
focus, step by step. At each step ask: what can't they see or find? what do they wait
on, guess at, or redo by hand? Every stumble is a task idea.

Then check the focus's written sources — the code, roadmap doc, user-facing docs
(Configuration), `archive.md`, `todo/`, `rejected.md`, `memory.md` — to catch promised
work and stop re-proposals.

## 3. Propose 3 tasks

All inside the focus; none already on the board, in `archive.md`, or in `rejected.md`
(unsure one is already done? run the check in `references/task-review.md`). Write each
with the "Add a task" flow in `SKILL.md`.

## 4. Record

Update `docs/kanban/memory.md` so the next loop skips re-reading: where users stumbled
(keep the gap, drop the details), a review watermark per source, and this loop's focus
so the next one rotates. Prune stale notes; split into `memory/<topic>.md` when long.

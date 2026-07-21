# Propose new tasks

Run this when the user asks to propose work. Pick **one focus area**, then propose
**3 new tasks inside it**. New work, not picks from the board.

Why one focus: three scattered ideas skim the whole product; three tasks in one area
close its gap.

## 1. Pick the focus

One area — a product area, a track, or a theme (e.g. "the local UI", "onboarding").

**Always ask the user which area they want to improve first.** They can skip it, but an
area from them beats one you guess. If they name an area, use it. If they leave it open,
pick one yourself, in this order:

- the area that changed most since last review (`git log` vs. the watermarks in
  `memory.md`);
- else the area where `memory.md` says users stumble most.

Write the focus down in one line. Everything below stays inside it.

## 2. Walk the focus as a user

Ideas come from a **walkthrough**, not from a feature list. Play one user story in the
focus area, step by step: a real person, a real session, a real goal. At each step ask —
what can't they see? what can't they find? what do they wait on, guess at, or redo by
hand? Every stumble is a task idea.

Example: walking "I open the board to pick my next task" surfaces "I can't tell which
card an agent is on, or which card is ready to start" — a gap no roadmap ever wrote down.

Then check the written sources for the focus — only ones changed since their watermark
(or never reviewed): the codebase, your roadmap doc, your user-facing docs
(Configuration), `archive.md`, `todo/`, `rejected.md`, `memory.md`. These catch promised
work and stop re-proposals; the walkthrough is where new ideas come from.

Record the stumbles you find, and the new watermark, in `memory.md` (below).

## 3. Propose 3 tasks in the focus

All three inside the focus. Not on the board, not in `archive.md`, not in
`rejected.md`. Unsure one is already done? Confirm first (`references/add-task.md`,
step 2). Then write each with the "Add a task" flow in `SKILL.md`.

## Memory

`docs/kanban/memory.md` is what lets the next loop skip re-reading everything.

- Write as user stories: what the user was trying to do, where they stumbled.
- Highly summarized — keep the gap, delete the details.
- Keep a review watermark per source (the date you reviewed it).
- Note this loop's focus, so the next loop rotates.
- Prune stale notes. Split into `memory/<topic>.md` when long; merge back when short.

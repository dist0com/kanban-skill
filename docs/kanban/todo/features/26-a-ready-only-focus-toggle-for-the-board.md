---
title: A ready-only focus toggle for the board
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: [24, 25]
questions: []
---

Add one toggle to the board that hides every card that isn't `ready` (or already running), so a user who just wants to build sees only vetted, startable cards.

## Scope
- Add a "Ready only" toggle to the board. When it's on, each column shows only cards
  whose `status` is `ready`. When it's off, the board shows all open cards like today.
- Keep the columns as they are — only filter the cards inside each column. Don't hide
  or reorder columns.
- Keep `implementing` cards visible even when the toggle is on. A card an agent is
  running (or one that's mid-implement) shouldn't vanish while it's in flight.
- Put the toggle in `kanban-ui/components/Board.tsx` (the `BoardView` client
  component), near the columns — not in the shared `Header.tsx`, since the header is
  also used by the card pages and this control only belongs to the board.
- Hold the on/off state in local component state only. No saved preference, no URL
  state — the toggle resets to off on reload. That's fine for the MVP.
- A column that has no matching cards while the toggle is on still shows an empty
  note. Reuse the existing "no open cards" note; when the toggle is on, word it as
  "nothing ready" so it's clear why the column is empty.
- This is part of the same board-focus effort as #24 (pick-order sort) and #25 (show
  un-startable cards), but this card is only the ready-only toggle. Don't pull their
  work in here.

## Todo
- [ ] Add a boolean state (e.g. `readyOnly`) to `BoardView`, default off.
- [ ] Add the toggle control near the top of the board, above the columns, wired to that state.
- [ ] Filter each column's cards: when `readyOnly` is on, keep only cards with status `ready` or `implementing`; otherwise keep all.
- [ ] Update the empty-column note so an empty column reads "nothing ready" when the toggle is on, and "no open cards" when it's off.
- [ ] Check the column count number matches the filtered card count shown.
- [ ] Test: with the toggle on, only `ready` and running/`implementing` cards show; turning it off brings every card back.

---
title: Show on the board which cards you can't start yet
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: [24, 26]
questions: []
---

On the board, mute cards you can't start yet and mark why, so a user picking their next task skips the ones that are waiting.

A card can't be started when either is true:
- It is still blocked: an id in its `blocked_by` is still an open card on the board.
- It has open questions: `questions` is non-empty (these must be answered before the card can be refined).

## Scope
- In `kanban-ui/lib/board.ts` `readBoard`, `openIds` already lists every open card. Compute a `blocked` flag per card there: true when any id in `blocked_by` is in `openIds`. Set it on each board card.
- In `kanban-ui/lib/types.ts`, add `blocked: boolean` to `Card` so the flag reaches the UI.
- In `kanban-ui/components/Board.tsx` (card render loop, ~line 87-145), when a card is blocked or has open questions, mute it: lower the card opacity so it reads as "waiting".
- Add a small "blocked" marker chip when `blocked` is true. Keep the existing open-questions help icon as the signal for the questions case (don't add a second marker for it).
- Add a `BlockedChip` in `kanban-ui/components/chips.tsx`, matching the existing chip styles (reuse the peach/`nb-chip` look, with a lock or block icon and a short hover tip like "Blocked by an open card").
- Only *show* the state here. The ordering (sinking a waiting card to the bottom of its column) is #24's job — don't do it in this card.

## Todo
- [ ] In `board.ts` `readBoard`, compute a `blocked` flag from `blocked_by` vs `openIds` and set it on each board card.
- [ ] Add `blocked: boolean` to `Card` in `lib/types.ts`.
- [ ] Add a `BlockedChip` in `chips.tsx` matching the existing chip styles, with a block icon and a short hover tip.
- [ ] In `Board.tsx`, mute the card (lower opacity) when it is blocked or has open questions.
- [ ] In `Board.tsx`, show `BlockedChip` when the card is blocked; keep the existing question icon for the open-questions case.
- [ ] Run the board locally and check a blocked card and a card with open questions both read as waiting; confirm `pnpm typecheck` and lint pass.

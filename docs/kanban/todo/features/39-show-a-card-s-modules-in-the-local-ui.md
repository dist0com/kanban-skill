---
title: Show a card's modules in the local UI
track: features
priority: med
roi: med
status: todo
blocked_by: [34]
related: [31, 34]
questions: []
---

Once a card carries a `modules` field (#34), show it in the local UI so you can
see at a glance what part of the product a card touches — not just its track.

The UI does not read this field yet: `CardMeta` in `kanban-ui/lib/types.ts` has
no `modules` key, and the frontmatter reader drops it. This card wires the field
through and puts it on screen.

## Scope
- Add `modules: string[]` to `CardMeta` in `kanban-ui/lib/types.ts`.
- Parse the list in `kanban-ui/lib/frontmatter.ts`. A card with no field, or an
  empty list, reads as no modules — the same as a distribution task that touches
  none.
- Add a module chip in `kanban-ui/components/chips.tsx`, next to the track chip.
  Reuse the existing pill style; give modules their own colour so they don't read
  as a second track. One chip per module — a card can name two.
- Show the chips on the board card (`Board.tsx`) and on the card page
  (`CardPage.tsx`). A card with no modules shows nothing extra.
- Read-only. This card only displays the field; editing it stays in the CLI.

## Todo
- [ ] Add `modules` to `CardMeta` and parse it in the frontmatter reader
- [ ] Add a module chip to chips.tsx with its own colour
- [ ] Show the chips on the board card
- [ ] Show the chips on the card page

---
title: Show group tasks in the UI with clickable subtasks
track: features
priority: med
roi: med
blocked_by: []
related: [11]
questions: []
---

Make the local UI understand a group task: show only the group card on the board, and on the group's page list its subtasks as links the user can click to open. Today the board can't reach a group's subtasks at all.

## Why it matters

A group task (like #11) holds several subtask cards in one folder. The board should show one card for the group, not a card per subtask — otherwise a big group floods the board. But the user still needs to reach each subtask. Right now they can't: the board reader loads a group's `root.md` and never reads the files under it, so the subtasks are invisible and there's no link to them. A top-level group folder also shows up as its own column, which looks wrong.

## Current behavior (what to fix)

- `lib/board.ts` reads a group folder's `root.md` as one card and stops — it never reads the subtask files, so nothing in the UI knows they exist.
- The board groups cards by top-level folder, so a group folder that sits at the top of `todo/` becomes its own column instead of one card in a track.

## Scope

- Read a group's subtasks. When a folder holds a `root.md`, also read the subtask cards inside it, and attach them to the root card (id, title, and the same light meta the board already shows — track, todos, later status).
- On the board, show **only the group's root card**. Never show a subtask as its own board card.
- On the group's card page, list its subtasks as **links** — each showing at least its id and title. Clicking a link opens that subtask's card page (`/[id]`), which already works for any id.
- Each subtask page should link back to its group root, so the user can go up as well as down.
- Make sure a group folder is rendered as one card in its track, not as its own column.

## Open questions

- Where does a group folder live on disk — at the top of `todo/` (as the skill's group spec shows) or inside a track folder (as `lib/board.ts` currently assumes)? Settle this so the group renders under one clean track column and the reader finds the subtasks the same way every time. #11 is the first real group to test against.
- On the subtask links, show just id + title, or also progress (todos done) and status? Keep it to id + title for the first version unless it's cheap to add.

## Todo

- [ ] Read a group's subtask cards and attach them to the root card in `lib/board.ts`.
- [ ] Show only the group root on the board; never render a subtask as a board card.
- [ ] On the group card page, list subtasks as links to their `/[id]` pages.
- [ ] Link a subtask page back to its group root.
- [ ] Ensure a group folder renders as one card in its track, not its own column.
- [ ] Settle where a group folder lives on disk so the reader is consistent.
- [ ] Update `references/local-ui.md` to describe how groups show in the UI.

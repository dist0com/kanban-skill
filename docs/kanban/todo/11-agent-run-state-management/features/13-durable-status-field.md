---
title: Add a durable status field to the card format
track: features
priority: med
roi: med
blocked_by: [12]
related: [11]
questions: []
---

Add a `status` field to a card's frontmatter so its stage — `todo`, `implementing`, or `in-review` — is saved on the card and survives a UI restart. The script owns this field, like every other one.

## Why it matters

The run registry (#12) shows what an agent is doing right now, but forgets it when the UI restarts. The user asked to *track* status, not just watch it. A saved `status` makes the stage part of the board's record: reopen the UI and a half-done card still reads "implementing". It also gives the board a status pill even when no agent is running.

## What status covers

Only stages a card can rest in: `todo` (default), `implementing`, `in-review`. `reject` and `archive` remove the card, so they have no saved status — those stay live-run-only in #12's registry.

## Scope

- Add `status` to the card frontmatter. Default `todo`. Allow only `todo`, `implementing`, `in-review`; a bad value is a hard error, like every other field. A missing field reads as `todo`, so old cards still parse.
- Let the script write it: `update <id> --status <state>`. Never hand-write frontmatter — the script stays the only writer.
- Read `status` in the board reader; show it as a pill on the card and board.
- Have the UI set status through the script when a run starts (`implementing` / `in-review`) and clear it to `todo` when a run ends without finishing the task.
- **Reconcile a stale status on start-up**: if a card says `implementing` but #12's registry has no live run for it, the UI crashed mid-run — reset it to `todo`, so the field never gets stuck.
- Record the format change in `redesign.md` under "Card format" and update `references/local-ui.md`.

## Open questions

- Does a new required field break `migrate` on older boards? Treat a missing `status` as `todo` and don't force a rewrite.

## Todo

- [ ] Add `status` to the frontmatter, with validation, default `todo`, missing reads as `todo`.
- [ ] Add `update <id> --status <state>` to the script; keep the script the only writer.
- [ ] Read `status` in the board reader; show a status pill on the card and board.
- [ ] Set status from the UI on run start; clear it on run end.
- [ ] Reconcile a stale `implementing` back to `todo` when no live run exists.
- [ ] Add a `redesign.md` note and update `references/local-ui.md`.

---
title: Show only the control buttons that fit the card's state
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: []
questions: []
---

The card page should show only the buttons that fit the card's state, so the user is never offered an action that makes no sense there.

## Scope
- Today the toolbar in `kanban-ui/components/CardPage.tsx` is a row of ad-hoc conditionals. Implement, Edit, and Reject always show. Resolve and Refine share one slot: Resolve when the card has open questions, Refine otherwise. Archive shows only when all todos are done.
- Turn this into one explicit state machine. One function (or table) takes the card's state — `status` (todo / ready / implementing), open questions, todo progress — and returns the buttons to show. The toolbar just renders that list.
- Put the state-to-buttons rules in one place: in `CardPage.tsx` or a small helper next to it, so anyone can read all the states at a glance.
- The state machine covers six buttons: Implement, Edit, Refine, Resolve, Archive, Reject. The full table is in Decisions below.
- Keep `busy` as is: while a run is live on the card, every visible button stays disabled. Only change this if the state machine says otherwise.
- Docs: `kanban-ui/README.md` lists the per-card buttons, so it must match the new rules (todo below).

## Decisions

- **Refine stays in the state machine** (user decision). It shows only on a `todo` card with no open questions. A `ready` card hides it — ready means the plan is concrete, so there is nothing left to refine. A card with open questions hides it too — Resolve takes its place, same as today. Transitions stay what the skill already does: a refine that ends concrete with no questions marks the card `ready`; a refine that raises questions leaves it `todo`, and Resolve replaces Refine on the next render.
- **A `todo` card with no open questions shows: Implement, Edit, Refine, Reject.** Refine is the natural next step, but Implement stays available — the user may implement without waiting for `ready`.
- **When all todos are checked, Implement hides and Archive becomes the main action.** A fully-checked card's fitting action is Archive; offering Implement there invites a pointless re-run. To re-run, the user unchecks a todo or edits the card. A card with zero todos never counts as all-checked (matches the current `allDone` guard).

Full state-to-buttons table (busy still disables every visible button):

| State | Buttons |
| --- | --- |
| `todo`, has open questions | Implement, Edit, Resolve, Reject |
| `todo`, no questions | Implement, Edit, Refine, Reject |
| `ready` (never has questions) | Implement, Edit, Reject |
| all todos checked, no questions | Edit, Archive, Reject |
| all todos checked, has questions | Edit, Resolve, Archive, Reject |

## Todo
- [ ] Add one function that returns the visible buttons for a card's state, following the table in Decisions.
- [ ] Replace the ad-hoc conditionals in the CardPage toolbar with that function.
- [ ] Check each state from the table by hand in the UI.
- [ ] Update the button list in `kanban-ui/README.md` to match.

---
title: Show only the control buttons that fit the card's state
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: []
questions:
  - The toolbar today has a sixth button, Refine, sharing a slot with Resolve. The requirement lists only 5 buttons — does Refine stay in the state machine, and in which states?
  - For a card that is not ready and has no open questions, which buttons should show? The requirement left this state blank.
  - When all todos are checked, should Implement hide so Archive becomes the main action, or stay for re-runs?
---

The card page should show only the buttons that fit the card's state, so the user is never offered an action that makes no sense there.

## Scope
- Today the toolbar in `kanban-ui/components/CardPage.tsx` is a row of ad-hoc conditionals. Implement, Edit, and Reject always show. Resolve and Refine share one slot: Resolve when the card has open questions, Refine otherwise. Archive shows only when all todos are done.
- Turn this into one explicit state machine. One function (or table) takes the card's state — `status` (todo / ready / implementing), open questions, todo progress — and returns the buttons to show. The toolbar just renders that list.
- Put the state-to-buttons rules in one place: in `CardPage.tsx` or a small helper next to it, so anyone can read all the states at a glance.
- Known states so far (the user did not list them all):
  - Card is ready: no Archive, no Resolve. Ready means it has no open questions.
  - All todos checked, not yet archived: show Archive.
  - Has open questions and todos not all checked: show Resolve.
- The state machine must cover every combination, not just these. The open questions in the frontmatter decide the blank cells: where Refine fits, what a not-ready card with no questions shows, and whether Implement stays once all todos are done.
- Keep `busy` as is: while a run is live on the card, every visible button stays disabled. Only change this if the state machine says otherwise.
- Docs: `kanban-ui/README.md` lists the per-card buttons, so it must match the new rules (todo below).

## Todo
- [ ] Write the full state-to-buttons table, using the answered frontmatter questions for the blank cells.
- [ ] Add one function that returns the visible buttons for a card's state.
- [ ] Replace the ad-hoc conditionals in the CardPage toolbar with that function.
- [ ] Check each state from the table by hand in the UI.
- [ ] Update the button list in `kanban-ui/README.md` to match.

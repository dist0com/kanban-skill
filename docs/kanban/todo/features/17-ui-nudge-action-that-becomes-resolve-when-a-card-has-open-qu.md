---
title: "UI: nudge action that becomes Resolve when a card has open questions"
track: features
priority: med
roi: med
blocked_by: []
related: []
questions: []
---

Add a Nudge button to a card in the local UI. When the card carries unresolved open
questions, the button becomes Resolve instead — a card waiting on decisions must not
be nudged further (the skill's rule in `references/nudge.md`).

## Scope

- Add a `nudge` agent action: prompt the agent to follow `references/nudge.md` on the
  card (review, then rewrite; record open questions with the script).
- Add a `resolve` agent action: prompt the agent to follow `references/resolve.md` —
  research each question, decide what the evidence settles, and log what still needs
  the user as it does today (open questions on the card, answered async — no mid-run
  reply channel, per `redesign.md`).
- On the card view, show one button in that slot: Nudge when the frontmatter
  `questions` list is empty, Resolve when it isn't. Never both.

## Todo

- [x] Add `nudge` and `resolve` to the agent actions and their prompts in
      `kanban-ui/lib/agent.ts`.
- [x] Swap the button by the card's `questions` frontmatter: empty → Nudge,
      non-empty → Resolve.
- [x] Update the button list in `references/local-ui.md` so the docs match the UI.

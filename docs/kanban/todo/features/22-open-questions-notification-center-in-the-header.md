---
title: Open-questions notification center in the header
track: features
priority: med
roi: med
status: todo
blocked_by: []
related: [21, 16]
questions: []
---

Add one place in the header to see every open question across all tasks, so you
can tell at a glance what still needs a human before a task is ready to build.

Cards already carry their open questions in the frontmatter (`questions`), and the
board reader already loads them onto every `Card`. Today you only see them one card
at a time. This gathers them into a single read-only notification center.

## Scope
- Add an icon button in the header, next to the runs button and agent badge. Use a
  question-mark / help icon (react-icons, e.g. `FiHelpCircle`).
- Show an iOS-style badge on the top-right of the icon: a small circle with the
  total count of open questions across the whole board. Hide the circle when the
  count is zero. Match the badge style already used by the runs button (#21).
- Clicking opens a panel (portaled to `<body>` like the other dialogs) that lists
  the open questions **grouped by task**: one section per card that has questions,
  showing the card `#id` + title as the heading and its questions as a list.
- Each card heading links to that card's page so the user can go resolve them.
- Read-only. No answering or editing questions from this panel — the user resolves
  them on the card, same as today.
- The data is the board the page already loads (each `Card.questions`); no new
  server read or persistence is needed. A card with an empty `questions` list is
  skipped.

## Scope out
- No answering / resolving from the panel. It only shows and links out.
- No live polling. Questions change only when an agent run edits a card, and the
  page already refreshes the board after a run — piggyback on that; don't add a
  new poll.

## Future vision (not to build now)
- The long-term idea is to grow this into a human-in-the-loop center that steers a
  proactive kanban — the user answers questions here and the board acts on them.
  This is only a direction to keep in mind, not scope. Note that live agent
  replies stay out of the design (see `redesign.md`); questions are answered on the
  card, and any future version must keep that shape. This connects to the autonomy
  levels work (#16).

## Todo
- [ ] Add a header component for the open-questions button + badge, sitting next
      to `Runs` and `AgentBadge`. It needs the board's cards to count questions —
      pass them from the page or read them where `Header` gets its data.
- [ ] Compute the total open-question count and show the iOS-style circle badge,
      hidden at zero, matching the runs button's badge.
- [ ] Build the panel: grouped by card (`#id` + title heading, questions as a
      list), each heading a link to the card page. Portal it to `<body>`.
- [ ] Handle the empty state — when no card has open questions, show a short
      "nothing to resolve" message and no badge.
- [ ] Update `skill/references/local-ui.md` to describe the open-questions center.
</content>

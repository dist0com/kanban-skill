---
title: Redirect to the board when a task id is not found
track: features
priority: low
roi: med
status: implementing
blocked_by: []
related: []
questions: []
---

When a task id has no card, send the user back to the board instead of showing a dead 404. A card that was archived or rejected leaves its old URL dangling; the redirect keeps the user moving.

## Scope
- Add `app/not-found.tsx` to the kanban UI. Today `[id]/page.tsx` calls `notFound()` for a bad or missing id and Next renders its default 404.
- The not-found page shows a small box: "This task is not on the board. Taking you to the board…" with a 5-second countdown.
- After 5 seconds, redirect to the board home (`/`). Also give a link to go now.
- Keep it plain: one box, centered, styled with inline Tailwind like the rest of the UI.

## Todo
- [ ] Add `app/not-found.tsx` as a client component with a 5s countdown, then redirect to `/`.
- [ ] Show the countdown seconds in the box and a "Go to the board" link for an early exit.
- [ ] Confirm both a non-number id and a valid-but-missing id land here (both already call `notFound()`).

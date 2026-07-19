---
title: Stream agent logs and allow human-in-the-loop
track: ui
priority: low
roi: med
blocked_by: [7]
related: []
questions: []
---

The first local UI (#7) fires an agent and waits. It shows only a "running" state, not
what the agent is doing, and the user cannot answer the agent mid-run. Add live logs and
a way to reply while the agent works.

## Why it matters

When an Implement or Review run takes a while, the user is blind. Seeing the steps builds
trust and catches a wrong turn early. Letting the user answer a question mid-run means the
agent does not have to guess or stop.

## Scope

- Stream the agent's output to the card while it runs, instead of a plain "running" state.
- Let the user send a reply back to the running agent (human-in-the-loop).
- Keep it local-only and file-based; no change to where the board lives.

## Open questions

- Which agent transport gives us a live stream and a reply channel with `claude`?
- Do we show logs inline on the card or in a side panel?

## Todo

- [ ] Pick how to stream `claude` output and send input back.
- [ ] Show live agent output on the card during a run.
- [ ] Add a reply box so the user can answer the agent mid-run.

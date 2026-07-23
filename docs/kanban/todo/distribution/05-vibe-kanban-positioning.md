---
title: Position against Vibe Kanban and target the winnable keywords
track: distribution
priority: med
roi: med
blocked_by: []
related: [2]
modules: []
questions: []
---

Vibe Kanban is the best-known "kanban for AI coding agents" and it is shutting down
(the company Bloop closed; the project continues as community open source). That leaves
a stream of people looking for where to go next. We can catch some of them — but only if
we are honest about the difference: Vibe Kanban is a cockpit for running many coding
agents in parallel (web app, worktrees, execute-and-review). Our skill is a planning
board Claude edits in your repo. We do not orchestrate parallel agents. If we bill
ourselves as a drop-in Vibe Kanban replacement, we attract people who want orchestration
and lose them.

Live keyword check (US Google):
- `vibe kanban` — 1,900 searches/mo, difficulty 12, but it is a branded, navigational
  term: every top result is Vibe Kanban itself. Not a term we can rank for or should
  headline. Wrong intent (they want that product, not an alternative).
- `vibe kanban alternative` — ~30/mo. Winnable with a real comparison page, but the page
  competes with tools that actually do orchestration (Nimbalyst, MergeLoom, Parallel Code).
- `claude code kanban` — difficulty 9, on-intent, winnable. This is our real anchor.
- `markdown task board` — winnable, describes what we are.

## Scope
- Keep our own concept as the anchor in the README and any landing copy. Do NOT rename
  ourselves to "Vibe Kanban alternative" in the headline.
- Lead with `claude code kanban` + `markdown task board`. Scatter secondary phrases
  naturally: "kanban designed for Claude Code", "why Markdown for the task board".
- Write a "Coming from Vibe Kanban?" comparison as a bridge for the shutdown traffic,
  framed on the real difference (planning board vs. agent-orchestration cockpit), targeting
  `vibe kanban alternative` and `vibe kanban shutdown`.
- The comparison page does NOT belong in this GitHub repo. It lives on the skill's site
  (see the site decision in #2) — a `/vs/vibe-kanban` page or a section on the landing page.

## Todo
- [ ] Rewrite the README opening + section copy to embed `claude code kanban` and
      `markdown task board` naturally, without headlining a competitor's brand.
- [ ] Draft the "Coming from Vibe Kanban?" comparison copy (planning vs. orchestration,
      honest about what we don't do). Hold it for the site, not the repo README.
- [ ] Once #2 settles where the site lives, publish the comparison as `/vs/vibe-kanban`
      (or a landing section) and point it at the alternative/shutdown terms.

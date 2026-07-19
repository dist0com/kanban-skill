---
title: Build a local kanban UI
track: ui
priority: high
roi: high
blocked_by: []
related: [9]
questions: []
---

Build a small web app the user runs on their own machine to see the board and run
kanban work. The user does not hand-edit the board. Instead each card has buttons that
spawn an agent (`claude -p`) to do the work — implement, review, reject, archive — and
the app just shows the files the agent changed.

## What the user does NOT do by hand

The board is written by agents, not by people clicking around. So the UI has:

- **No manual todo toggling.** The agent that implements the task checks the todos.
- **No manual "write a card" form.** New cards come from an agent (see "Create task").
- **No manual move or mark-done.** Moving tracks and finishing are agent jobs.

## The agent connector

Every action button sends a prompt to an agent and lets the agent do the real kanban
work using this skill.

- Default command is plain `claude -p`. We only support a Claude Code subscription, so
  no extra arguments and no env vars — just `claude -p "<prompt>"` run in the repo.
- The command is configurable in one place (a settings file or field), so a user can
  point it at a different agent later. Default stays `claude -p`.
- **No human-in-the-loop and no live logs** in this task. A button fires the agent and
  the UI shows a simple "running" state, then refreshes the board when the run ends.
  Streaming logs and a chat back-and-forth are a separate future task (#9).

## Buttons on each card

Each one opens a small dialog first, then calls the agent connector.

- **Implement** — do the work described by the card. Dialog: optional extra notes. The
  agent reads the card, implements it, and checks off the todos.
- **Review** — "what else do I need to do?" The agent checks whether the task is really
  done. If not, it raises questions for the user to decide and saves them in the card's
  `questions` metadata. The user answers them later (through Edit or a follow-up run),
  and the answers shape priority, roi, blocked-by, related, and the title.
- **Reject** — drop the task. Dialog: rejection reason. The agent runs the reject flow
  (adds the line to `rejected.md`, removes the card).
- **Archive** — only shown when **all todos are checked**. The agent runs the finish
  flow (writes the 1-2 line "what you can now do" note, moves it to `archive.md`,
  removes the card).
- **Edit** — manual edit. Dialog with the card's text. The user can change the **title**
  and the body (summary + scope). Saved straight to the file, no agent.

## Board-level button

- **Create task** — dialog: describe what you want. The agent turns the requirement into
  one or more cards using the add-task flow. It may create several cards from one input.

## Metadata the user can change directly

- **Priority** and **ROI** — quick-adjust on the card (e.g. a small dropdown), written
  straight to the file.
- Everything else is **not** hand-editable: `track` (the folder), `id` (the script),
  `blocked_by`, `related`, and `questions` are all managed by agents or the script.

## Card format

- The board uses the **markdown meta (frontmatter)** format for every card (shipped in
  #8). The UI reads and writes those fields.
- Fields the UI cares about: `title`, `track`, `priority`, `roi`, `blocked_by`,
  `related`, `questions`, plus the body (summary, scope, todo checklist).

## Rendering the card body

- **Render the body as markdown, not raw text.** The card detail view runs the body
  through a markdown renderer so headings, lists, bold, and the todo checklist show as
  formatted text — never a code block or plain dump.
- **Todos render as real, read-only checkboxes.** The `- [ ]` / `- [x]` list shows as
  disabled checkboxes (checked state from the file). The user does not toggle them here.
- **`#46`-style task ids render as links.** Any `#<number>` in the body becomes a link.
  Clicking it closes the current card and opens card `#46` in the same view (client-side
  state, no page navigation). Only linkify ids in plain text — not inside code spans or
  code blocks. If the id is not an open card (archived, rejected, or missing), show it as
  plain text, not a dead link.

## Design constraints

- **Files stay the source of truth.** The app and the agents only read and write the
  markdown in `docs/kanban/`. No database, no hidden state — still plain and
  git-diffable. Keeps the "no database" principle in `memory.md`.
- **Local only.** The server runs on `localhost`. No hosting, no login.
- **Use the script for id-touching moves.** The agents reach `kanban.mjs` for create,
  archive, and reject so ids and metrics stay right. The script sits behind a symlink,
  so it must run with `node --preserve-symlinks-main` (or its real path).

## Decisions (from the user)

- **Location:** a new top-level `kanban-ui/` folder, separate from the marketing `web/`.
- **Columns:** open work is by track — `Blockers`, then each track folder. Archived work
  is **not** a status column (archive entries have no ids and no track). Show it separately,
  grouped by its **category** (the topic headings in `archive.md`), read-only.
- **Stack:** Next.js.
- **Look:** follow `/Users/wutao/git/dist0/web/design.md` (soft neo-brutalism — warm
  cream canvas, ink outlines, hard offset shadows, one ember accent). Reuse its tokens
  and utility classes.

## Scope

- Scaffold a Next.js app in `kanban-ui/` with the dist0 neo-brutalism tokens.
- Read `docs/kanban/` (frontmatter cards, `blockers/`) into columns by track; read
  `archive.md` into a separate read-only "Done" view grouped by category (topic heading).
- Card detail view: render the body as markdown, todos as read-only checkboxes, and
  `#<number>` ids as links that open that card.
- Agent connector: run a configurable command, default `claude -p "<prompt>"`, fire it
  in the repo, show a running state, refresh on finish. No streaming, no HITL.
- Wire the buttons: Implement, Review, Reject, Archive (when todos done), Create task.
- Direct edits: Edit dialog (title + body), and quick priority / roi adjust. Written
  straight to the file — the UI validates fields (fixed dropdowns for priority/roi) so bad
  values can't slip in, no need to route through the script.
- Add the minimal "Run the board locally" section to `SKILL.md` and the full steps to
  `references/local-ui.md`.

## Todo

- [x] Scaffold the `kanban-ui/` Next.js app (app router, Tailwind, dist0 tokens).
- [x] Board reader: parse frontmatter cards + `blockers/` into track columns; parse
      `archive.md` topic headings into a read-only Done view grouped by category.
- [x] Board view: columns by track with cards (title, id, track, priority, roi).
- [x] Card detail view: render the body as markdown (react-markdown + remark-gfm), todos
      as disabled/read-only checkboxes.
- [x] Linkify `#<number>` ids in the body (plain text only, not code); click closes the
      current card and opens that card; non-open ids stay plain text.
- [x] Agent connector: run configurable `claude -p "<prompt>"` in repo, running state,
      refresh on finish, one place to configure the command.
- [x] Implement button + notes dialog → agent prompt.
- [x] Review button → agent prompt that writes `questions` metadata.
- [x] Reject button + reason dialog → agent prompt.
- [x] Archive button (only when all todos done) → agent prompt.
- [x] Create-task board button + requirement dialog → agent prompt (may make many cards).
- [x] Edit dialog: edit title + body, write to file (no agent).
- [x] Quick-adjust priority and roi, write to file (no agent; UI validates the values).
- [x] Apply the neo-brutalism design (tokens, `.nb-panel`, `.nb-cta`, `.nb-press`).
- [x] Add the minimal "Run the board locally" section to `SKILL.md`.
- [x] Write the full setup steps in `references/local-ui.md` and link from `SKILL.md`.

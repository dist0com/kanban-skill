# Run the board locally (kanban-ui)

`kanban-ui/` is a small Next.js app you run on your own machine to see the board and drive
the kanban work. You do **not** hand-edit the board through it. Each card has buttons that
spawn an agent (`claude -p`) to do the real work — implement, review, reject, archive — and
the app just shows the board again once the agent is done. The markdown files in
`docs/kanban/` stay the single source of truth: no database, no hidden state.

## Start it

```
cd kanban-ui
npm install        # first time only
npm run dev        # http://localhost:3000
```

It runs on `localhost` only — no hosting, no login. Start it from `kanban-ui/` (or the repo
root); it finds the board by walking up to the first `docs/kanban/todo/`.

## What you see

- **Columns by track.** `Blockers` first, then one column per track folder, in the order the
  board `README.md` lists them. Each card shows its id, title, priority, and ROI, plus a
  todo count and a `?` when it has open questions.
- **A read-only "Done" view.** Archived work is grouped by its topic heading from
  `archive.md`. Archive entries have no id and no track, so they are shown separately and are
  not a status column.
- **Card detail.** Click a card to open it. The body renders as markdown — headings, lists,
  bold, and the todo checklist as real (read-only) checkboxes. Any `#<number>` in the body
  that points at an open card becomes a link; clicking it opens that card. Ids that are
  archived, rejected, or missing stay plain text.

## The buttons

Each button opens a small dialog, then hands a prompt to the agent connector. While the
agent runs you see a plain "running" state; the board refreshes when it finishes. (Live logs
and answering the agent mid-run are a separate, later feature — task #9.)

- **Implement** — do the work the card describes. Optional notes. The agent reads the card,
  implements it, and checks off the todos.
- **Review** — "what else is needed?" The agent checks whether the task is really done and,
  if not, records open questions in the card's `questions` metadata for you to answer later.
- **Reject** — drop the task. You give a reason; the agent runs the reject flow (a line in
  `rejected.md`, then removes the card).
- **Archive** — shown only when every todo is checked. The agent runs the finish flow (the
  1-2 line "what you can now do" note in `archive.md`, then removes the card).
- **Edit** — a manual edit (no agent). Change the **title** and the body; saved straight to
  the file.
- **Create task** (top of the board) — describe what you want; the agent turns it into one or
  more cards with the add-task flow.

## What the UI writes directly vs. through an agent

- **Direct to the file, no agent:** the **title** and **body** (the Edit dialog) and the
  **priority** / **ROI** quick-adjust dropdowns. These are validated (priority/ROI are fixed
  dropdowns), and the frontmatter is re-serialized exactly the way the script writes it, so
  the diff stays clean.
- **Through an agent, using the script:** everything that touches ids or metrics — Create,
  Archive, Reject — plus Implement and Review. The agent uses this skill and its script, so
  ids and the daily metrics stay correct. `track`, `id`, `blocked_by`, `related`, and
  `questions` are never hand-edited in the UI.

## The agent connector

One command, configured in one place: `kanban-ui/agent.config.json`.

```json
{ "command": "claude -p" }
```

Every button spawns this command in the repo root with the generated prompt appended as the
final argument (no shell, so the prompt needs no escaping). The default is a plain
`claude -p` — a Claude Code subscription, no extra flags and no env vars. Point `command` at
a different agent to swap it; the default stays `claude -p`.

The prompts tell the agent to use this skill. Because the skill's script lives behind a
symlink (`.claude/skills/kanban/kanban.mjs`), the id-touching commands run it with
`node --preserve-symlinks-main` so it resolves `docs/kanban/next-id` correctly.

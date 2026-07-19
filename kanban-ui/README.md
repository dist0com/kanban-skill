# kanban-skill-ui

The optional local web UI for the [kanban skill](https://kanban-skill.pages.dev/) — a
task board that lives as plain Markdown in your repo under `docs/kanban/`. Run it on your
own machine to see the whole board and drive the work from buttons instead of the terminal.

The Markdown files in `docs/kanban/` stay the single source of truth. This UI reads them and,
for anything that changes the board, spawns an agent (`claude -p` by default) to do the real
work — so ids and metrics stay correct.

## Requirements

- Node.js 18.18+
- A repo that already has a `docs/kanban/` board (created by the kanban skill). Without one,
  there's nothing to show.

## Run it

From your repo root (the folder that holds `docs/kanban/`):

```bash
npx kanban-skill-ui        # http://localhost:7420
```

Localhost only — no hosting, no login. It ships a prebuilt server, so nothing compiles on
your machine. It finds the board by walking up from the current directory to the first
`docs/kanban/todo/`, so you can also run it from a subfolder.

### Options

```bash
npx kanban-skill-ui --board ../my-repo   # a board elsewhere (or set KANBAN_BOARD_DIR)
npx kanban-skill-ui --port 4000          # a different port (default 7420)
```

| Flag | Env | Default | Meaning |
| --- | --- | --- | --- |
| `-b, --board <dir>` | `KANBAN_BOARD_DIR` | current dir | repo that holds `docs/kanban/` |
| `-p, --port <n>` | `PORT` | `7420` | port to serve on |

### Always get the latest

`npx` caches by version. To force the newest published build:

```bash
npx kanban-skill-ui@latest
```

## Configure the agent

Each board button spawns an agent in your repo root. Set the command in your project at
`docs/kanban/ui.config.json`:

```json
{ "command": "claude -p" }
```

The default is `claude -p` (a Claude Code subscription). Point `command` at another agent to
swap it. This config lives next to the board — not inside this package — so `npx` always
serves the latest UI and your setting is never touched by an update.

## What it does

- **Columns by track**, a read-only **Done** view from `archive.md`, and a card detail view
  that renders the card body as Markdown.
- **Buttons per card** — Implement, Review, Reject, Archive, Create — each hand a prompt to
  the agent, then the board refreshes when it finishes.
- **Direct edits** — the title/body and the priority/ROI dropdowns save straight to the file;
  everything that touches ids or metrics goes through the agent and the skill's script.

## Links

- Kanban skill & docs: https://kanban-skill.pages.dev/
- Source: https://github.com/dist0com/kanban-skill (this package lives in `kanban-ui/`)

## License

Apache-2.0

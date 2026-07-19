# Run the board locally (kanban-skill-ui)

An optional Next.js app that shows the board and drives the work from buttons instead of the
terminal. The board works fully without it; set it up only when you want the buttons. The
markdown files in `docs/kanban/` stay the single source of truth.

## Run it

From your repo root (the folder that holds `docs/kanban/`):

```
npx kanban-skill-ui        # http://localhost:7420
```

Localhost only. It ships a prebuilt server (nothing to compile) and finds the board by
walking up to the first `docs/kanban/todo/`. Options:

```
npx kanban-skill-ui --board ../my-repo   # a board elsewhere (or set KANBAN_BOARD_DIR)
npx kanban-skill-ui --port 4000          # a different port
```

There's nothing to install — `npx` fetches the package and caches it. To pick up a newer
release, run it once as `npx kanban-skill-ui@latest`; later plain `npx kanban-skill-ui` runs
reuse that. (Prefer a permanent command? `npm install -g kanban-skill-ui`, then run
`kanban-skill-ui`, and `npm update -g kanban-skill-ui` to upgrade.)

## Configure the agent

Each button spawns an agent in the repo root. Set the command in `docs/kanban/ui.config.json`:

```json
{ "command": "claude -p" }
```

The default is `claude -p` (a Claude Code subscription). Point `command` at another agent to
swap it. The config lives next to the board, so `npx` always serves the latest UI and your
setting is never touched by an update.

## Run it from source (contributors)

Only if you're changing the UI itself. Build, then start the production server (not
`next dev` — run the app the way it ships):

```
cd kanban-ui
npm install                 # first time only
npm run build
PORT=7420 npm run start     # http://localhost:7420
```

To reproduce the exact `npx` package (standalone server): `npm run build:standalone` then
`node bin/kanban-ui.mjs`.

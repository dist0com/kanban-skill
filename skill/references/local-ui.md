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

## The buttons

The board has one **Create task** button. Each card page has its own toolbar:

- **Implement** — do the work and check off the todos.
- **Edit** — tell the agent how to change the card; it rewrites the plan.
- **Nudge / Resolve** — one slot that swaps by the card's state. When the card has no open
  questions it shows **Nudge** (move the plan one step forward). When the card carries open
  questions it shows **Resolve** instead (research and answer them) — a card waiting on
  decisions can't be nudged until the questions are cleared.
- **Archive** — appears once every todo is done; writes the "what you can now do" note and
  removes the card.
- **Reject** — add a one-line note to `rejected.md` and remove the card.

## Running several at once

Every button starts its agent in the background and returns right away, so you can set work
going on several cards at once and keep using the board. A small badge marks each card that
has an agent running and names the action in flight (`implementing`, `nudging`, `resolving`,
…), and you see it in every open tab — not just the one that started the run. The badge stands
in for the card's saved-stage pill while a run is live: one mark per card, never both.

Two guards keep runs from colliding:

- **One run per card.** A card that already has an agent running refuses a second one, with a
  message like "#5 is already being implemented". A double-click or a second tab can't start a
  duplicate run on the same card.
- **One board change at a time.** Create, Archive, and Reject each rewrite shared board files
  (the id counter, the index, the metrics), so they take turns — one finishes before the next
  starts. Implement and Edit on different cards still run side by side.

Runs also survive a UI restart: an agent still working when the server restarts is picked up
again and keeps its badge, and each run's full output is saved to disk so a past run can be
read back.

## Watching a run

You don't have to guess what a running agent is doing. On a card's page the last run's log
tails live while the agent works — every step shows as it happens, each tool call and each
message, so you can catch a wrong turn early. On the board, clicking a card's running badge
opens the same log in a pop-up. When a run ends the log leads with the agent's final message;
the step-by-step events fold away under an "intermediate events" row, one click to expand.
Each card's last finished run is saved to disk, so its "show last run log" button comes back
after a UI restart and re-opens the same output. A run that was still going when the UI
restarted shows as finished with no pass/fail mark — its exit went unseen, so the UI doesn't
guess one. The page shows only the last few KB; the full log is in the file. Watching is
read-only: you can't reply to a live run — anything the agent needs from you it leaves as an
open question on the card. (The live step stream needs the default `claude` agent; a custom
command's log shows whatever that command prints.)

**The runs panel.** The archive icon in the header is the one place to browse *every* run —
live and past, across every card and every action, not just one card. While agents are working
the icon wears a small count badge with a pulse. Click it to open a two-pane history: the run
list on the left (each row shows the action, its card `#`, a status dot, and when it started,
newest first), and on the right the run you pick — the text you typed for it (the create
description, an action's notes, or the reject reason) above its log. A create has no card page
of its own, so this panel is its home: starting a create opens the panel on it, and it stays
here to reopen after it finishes. The last 30 runs are kept; older ones age out (their logs
too), so the list never points at a log that's already gone. Per card the page still shows only
that card's own most recent run — the panel is the global view.

## The saved stage

Each card also remembers its stage in the card file, so it survives a UI restart even when no
agent is running. The stages, in order, are `todo` → `ready` → `implementing`.
A **Nudge** that lands a concrete plan with no open questions marks the card `ready` — the
plan is vetted and someone could start now, so you can scan the board for what to build next.
An **Implement** run marks the card `implementing`; when the run ends without finishing the
card, the stage goes back to `todo`. A card past `todo` shows a small stage pill on the board
and its page — but only when no agent is running on it (a live run shows the running badge
instead, never both). Implementing a card that isn't `ready` shows a gentle warning first, but
you can still go ahead. If the UI is restarted while a card is mid-run, the card keeps reading
its stage; if an `implementing` run had already died, that stage is reset to `todo` on
start-up so it never gets stuck (`ready` is kept — no run owns it).

## Group tasks

A group task (`todo/<id>-<slug>/root.md` with subtasks under `<track>/<subid>-<slug>.md`)
shows as a **single card** on the board, in the track its `root.md` frontmatter names — the
group folder is never its own column. Open that card and its subtasks are listed as links,
each with its id, title, and todo progress; clicking one opens the subtask's own page. A
subtask page links back up to its group root, so you can move down into the work and back up
to the tracking card. Subtasks never appear as separate cards on the board.

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

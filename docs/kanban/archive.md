# Archive

Shipped work, grouped by topic, in plain language. No task ids. Read before proposing so
you don't re-suggest something already done.

## Skill

- The skill is generalized from its dist0 origin: project name, tracks, planning sources,
  and reference docs are configurable, with sensible defaults when left blank.
- An `indie-hacker` preset packages the growth / validation / building tracks and the
  moat / trust / evidence review gates for a solo product launch.

## Setup

- A README install prompt sets up the skill in any project: it copies the skill, reads
  the codebase, asks a few questions, and fills the Configuration.
- One command scaffolds a fresh board — the folders, the index, and the starter files —
  so setting up in a new project no longer means creating them by hand.

## Board format

- Task cards now keep their meta — title, track, priority, roi, links, and open questions
  a human still needs to answer — in a YAML frontmatter block, so tools can read and write
  the board reliably.
- The kanban script now owns that meta: `create --title --track ...` scaffolds a card
  (frontmatter + body template + README entry), `update <id>` changes priority/roi/links,
  moves a card between tracks, or renames it, and `migrate` converts an old-format board.
  Every value is validated, so a bad track, level, or invented id is refused up front.

## Local board UI

- You can run a small web app on your own machine to see the whole board and drive the
  work from buttons — implement, review, reject, archive, and create a task each spawn an
  agent to do the real work, while quick edits to the title, body, priority, and ROI save
  straight to the files.
- You start that app with one command from your repo — `npx kanban-skill-ui` — with nothing
  to install or build, and set which agent its buttons use in a small file next to the board.
- A card shows a Nudge button to push it one step forward. When the card is waiting on open
  questions, that button turns into Resolve, so you settle the questions before nudging again.
- You can run agents on several cards at once. Each running card shows a live badge in every
  tab, a card already running refuses a second run on it, and a run keeps going and can be read
  back even if you restart the app.
- A card remembers its stage — implementing or in review — right in the card file, so it still
  shows the stage after you restart the app. If a run dies, the stage resets so it never sticks.
- You can reopen a card's most recent run log after the run ends and after you restart the app,
  so you can read back what an agent did. Only the last several runs are kept.
- A vetted card now shows a `ready` pill, so you can scan the board for what to build next
  instead of re-reading card bodies. A nudge that ends with a concrete plan and no open
  questions marks the card ready; a new open question drops it back to a plain todo.
- A link to a task that is no longer on the board (archived, rejected, or a bad URL) shows
  a short notice and sends you back to the board after a few seconds, instead of a dead 404.
- A group task shows as one card on the board (never a card per subtask). Its page lists
  the subtasks as links with todo progress, and each subtask page links back up to the root.
- An archive icon in the header opens one place to browse every agent run — live and past,
  across all cards and actions. It shows the run's input and full log side by side, badges a
  count while runs are live, and keeps the last 30 runs even after you restart the app.
- The command and button that push a card one step forward are now called Refine — you say
  "refine #4" or press the Refine button (it used to be Nudge).

## Distribution

- The repo is open source under Apache License 2.0, with a publishing kit for getting
  the skill onto marketplaces.
- You can install the skill as a Claude Code plugin from the public repo, and with one
  command from the skills.sh directory (`npx skills add dist0com/kanban-skill`). It's been
  submitted to the community plugin marketplace and is awaiting review.

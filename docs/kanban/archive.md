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

## Distribution

- The repo is open source under Apache License 2.0, with a publishing kit for getting
  the skill onto marketplaces.
- You can install the skill as a Claude Code plugin from the public repo, and with one
  command from the skills.sh directory (`npx skills add dist0com/kanban-skill`). It's been
  submitted to the community plugin marketplace and is awaiting review.

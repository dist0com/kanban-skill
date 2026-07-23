# Redesign

Design mistakes to avoid when writing a card, grouped by topic. One entry each: the
mistake, then the design we actually want. Read before writing or reviewing a card.

## Local UI

- ❌ **UI lets people hand-edit the board** (toggle todos, write cards, move, mark done) →
  ✅ the UI spawns agents (`claude -p`) to do the kanban work; on-card buttons (Implement,
  Reject, Archive) call the agent connector. Only priority/roi and a title/body
  Edit are direct.
- ❌ **UI adds human-in-the-loop / a mid-run reply channel to the agent** → ✅ we don't do
  live replies; the agent raises "open questions" on the card and the user answers those.
  The only live view of a run is a read-only tail of its log.
- ❌ **Keep an agent run's output only in memory** → ✅ write each run's full log to a
  gitignored file, so it survives a restart and past runs can be audited. The UI tails
  the file.
- ❌ **Show a run's log only while it's live** (visible for one moment, gone after the run
  or a restart) → ✅ the log is a place, not a moment: the card's most recent run stays
  openable after the run ends and after a restart. One run is enough — a per-card run
  history list is overdesign.
- ❌ **Browse every past run from a card page** (per-card history list) → ✅ per-card stays
  one run, but there's ONE global runs panel in the header (an archive icon) to browse all
  runs — live and past, every action and card — showing each run's input + log. Keep 30.

## Project memory

- ❌ **Assume one top-level folder is one module** → ✅ a module can span several folders
  and two modules can share one, so no code maps a file path back to a module. Only the
  module's name is machine-read; where it lives is prose, a reference for the reader.

## Card format

- ❌ **Meta in bold lines under the title** (`**Track:** ... **Priority:** ...`) → ✅ a
  markdown frontmatter block (`title`, `track`, `priority`, `roi`, `status`, `blocked_by`,
  `related`, `questions`) so programs can parse and write it. Add `questions` for
  decisions a human still owes.
- ❌ **A card's stage lives only in the UI's memory** (lost on restart) → ✅ a `status`
  field in the frontmatter (`todo` / `ready` / `implementing`, default `todo`, a
  missing value reads as `todo`) so the stage is part of the board's record and survives a
  UI restart. The script is the only writer, like every other field.

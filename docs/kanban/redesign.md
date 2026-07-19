# Redesign

Design mistakes to avoid when writing a card, grouped by topic. One entry each: the
mistake, then the design we actually want. Read before writing or reviewing a card.

## Local UI

- ❌ **UI lets people hand-edit the board** (toggle todos, write cards, move, mark done) →
  ✅ the UI spawns agents (`claude -p`) to do the kanban work; on-card buttons (Implement,
  Review, Reject, Archive) call the agent connector. Only priority/roi and a title/body
  Edit are direct.
- ❌ **UI streams agent logs / human-in-the-loop in the first version** → ✅ first version
  fires the agent and refreshes on finish; streaming and mid-run replies are a later task.

## Card format

- ❌ **Meta in bold lines under the title** (`**Track:** ... **Priority:** ...`) → ✅ a
  markdown frontmatter block (`title`, `track`, `priority`, `roi`, `blocked_by`,
  `related`, `questions`) so programs can parse and write it. Add `questions` for
  decisions a human still owes.

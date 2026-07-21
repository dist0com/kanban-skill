---
title: Script update on a group subtask moves the card and breaks its track
track: skill
priority: high
roi: high
status: todo
blocked_by: []
related: [11]
questions: []
---

Fix `update` so it leaves a group subtask where it is. Today any update on a subtask silently moves the card and rewrites its track — it corrupts the board.

## What happens

A group subtask lives at `todo/<group>/<track>/<id>-<slug>.md`. The `update` command reads the track as the first folder in the path. For a subtask that folder is the group, not the track. So any update — even just `--status` — rewrites `track:` to the group's folder name, moves the file up out of its track folder, and re-indexes it under a new wrong README heading.

This is not rare: the local UI shells out to `update <id> --status` on every Implement run. One run on a group subtask breaks the board. It happened on #14 during a refine and had to be repaired by hand.

## Scope

- An update on a group subtask keeps the file where it is and keeps its real track.
- `--track` on a subtask should move it between track folders inside its group, or say it can't — not move it out of the group.
- The README entry for a subtask stays a nested bullet under its group root.
- Add a test: update a subtask's status, check the file, its track, and the README did not change.

## Todo

- [ ] Make `update` read a subtask's track from the folder next to the file, not the first folder in the path.
- [ ] Keep the file in place on a plain field update; no move, no re-index.
- [ ] Decide what `--track` means for a subtask (move within the group, or refuse) and make it do that.
- [ ] Add a test that updates a subtask and checks nothing moved.

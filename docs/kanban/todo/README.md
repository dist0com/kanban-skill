# Board

Open tasks for the kanban skill. One card per file. Ids are global and never reused —
the number at the front of a filename is the task id.

Blockers gate the next milestone; clear them first. Everything else sits under a track.

## Blockers

_(none)_

## features

- [#11 Agent run state management](11-agent-run-state-management/root.md) — group
  - [#12 Run registry, non-blocking runs, and locks](11-agent-run-state-management/features/12-run-registry-and-locks.md)
  - [#13 Add a durable status field to the card format](11-agent-run-state-management/features/13-durable-status-field.md)
  - [#14 Tail the run log on the UI](11-agent-run-state-management/features/14-tail-logs-on-ui.md)
- [#15 Show group tasks in the UI with clickable subtasks](features/15-show-group-tasks-in-the-ui-with-clickable-subtasks.md)
- [#17 UI: nudge action that becomes Resolve when a card has open questions](features/17-ui-nudge-action-that-becomes-resolve-when-a-card-has-open-qu.md)

## skill

- [#6 Keep the board's config in the project, not in SKILL.md](skill/06-project-local-config.md)
- [#16 Autonomy levels: a global config for how far agents go alone](skill/16-autonomy-levels-a-global-config-for-how-far-agents-go-alone.md)

## docs

- [#3 Add a worked example to the guides](docs/03-add-worked-example-to-guides.md)

## distribution

- [#2 List on a second marketplace and decide the site](distribution/02-second-marketplace-and-site.md)
- [#5 Position against Vibe Kanban and target the winnable keywords](distribution/05-vibe-kanban-positioning.md)

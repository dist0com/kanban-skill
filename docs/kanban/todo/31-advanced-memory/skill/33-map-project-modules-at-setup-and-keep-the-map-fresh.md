---
title: "Map the project's modules at setup and keep the map fresh"
track: skill
priority: high
roi: high
blocked_by: []
related: [31, 32]
questions:
  - Is daily the right refresh cadence, or should the map refresh whenever a propose scan runs?
  - Should the setup step ask the user to confirm the map, or write it fully on its own?
---

Confirmed first piece of the memory layer. At setup, scan the repo and write down
what modules the project contains. Refresh the map on a cadence so it stays true as
the code changes.

## Scope
- At install/init, scan the repo and write a module map: one line per module —
  its name, what it does, and where it lives.
- Store it at `docs/kanban/memory/modules.md` as the default place; move it if
  #32 decides a different layout.
- Add a recurring card that refreshes the map (daily-ish, see open question). A
  refresh re-scans the repo, updates changed modules, and drops removed ones.
- Point the propose flow at the map, so "pick one focus area" starts from real
  modules instead of a fresh guess.
- Update the skill's install prompt and SKILL.md so the setup step and the new
  file are documented.

## Todo
- [ ] Add the module scan to the setup/install step
- [ ] Write the map to docs/kanban/memory/modules.md
- [ ] Add a recurring card that refreshes the map
- [ ] Make the propose flow read the map
- [ ] Document the map in the install prompt and SKILL.md

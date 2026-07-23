---
title: Map the project's modules at setup
track: skill
priority: high
roi: high
status: todo
blocked_by: []
related: [31, 32, 34]
questions: []
---

Confirmed first piece of the memory layer. At setup, scan the repo and write down
what modules the project has. Then read that map when picking what to work on,
instead of guessing from the code each time.

## The file

`docs/kanban/modules.md` — flat, next to `archive.md` and `memory.md`. Not inside
`memory/`. One line per module:

```
- **kanban-skill** — the skill itself: SKILL.md, the script, the references.
  Lives in `.claude/skills/kanban/`, `skill/`, `.claude-plugin/`.
- **local-ui** — the localhost board UI, shipped as `npx kanban-skill-ui`. `kanban-ui/`.
```

Only the bolded name is read by code. Everything after it is prose. The paths in
the prose are a reference for the reader, never parsed — a module can span
several folders, and two modules can share one, so nothing maps a file path back
to a module. No commit sha, no watermark, no dates in the file.

## Who writes it

A new `references/module-map.md`: what counts as a module, how to write one line
for it, and how to repair a line that no longer matches the repo. Install runs
it over the whole repo. A rebuild later runs the same doc again.

## Who reads it

- `references/propose.md` step 1 — the map gives the candidate focus areas. It
  does not limit the choice; a theme like "onboarding" is still a valid focus.
- `kanban.mjs`, when checking `--modules` on a card (#34). It parses names only.

Every reader is also a repairer — see below.

## How it stays true

No schedule, no hook, no git check, no path parsing. The rule that covers every
kind of drift: **whoever reads the map and sees it disagree with the repo fixes
it in the same run.** The map opens with one line saying exactly that, so every
future reader learns the rule from the file itself.

One trigger per way the map can drift:

- **A module is added.** Someone tags a card with a name that is not listed, the
  script rejects it (#34), and the map gains a line. A new module shows up the
  moment someone works on it. This is the main trigger.
- **A module is deleted or renamed.** Propose step 1 already scans the repo to
  pick a focus area. Before it uses the map, it crosses the map against that
  scan: a line whose module it cannot find in the repo gets deleted or renamed
  right there. A dead line lives only until the next propose.
- **Files move.** Only the prose location is wrong, and the reader-repairs rule
  covers it: an agent that opens the map and finds a line pointing at the wrong
  place fixes the line before going on. Harm is low either way — the name still
  points at the right area.
- **A description drifts** as a module grows. Accepted. A dated one-line summary
  still names the right area, which is all the propose flow needs. A rebuild
  refreshes it.
- **The user says the map is wrong.** Rerun `references/module-map.md`.

## Decisions

- **Paths are reference, not data.** We considered making each line's paths
  parseable so the script could flag a module whose paths are all gone. Rejected:
  the paths exist for the reader, and machine-checking them drags the format
  toward metadata. Deletion is caught by propose's cross-check instead.
- **Readers repair the map.** Reading and fixing are one step. This replaces the
  earlier stance that propose never updates the map — propose has the repo scan
  in hand anyway, so the cross-check is nearly free.

- **Setup writes the map on its own.** No confirm prompt — install has enough
  steps already, and a wrong line is cheap to fix. Print the finished map at the
  end so the user sees it once.
- **No recurring card, no daily cadence, no Claude Code hook.** A clock does not
  know when a module was added, and it refreshes when nobody is reading. A hook
  would make the skill edit each user's `settings.json` and fire in every session
  in their repo.
- **No git staleness check.** We tried two: a saved commit sha with
  `git diff`, and a check for folders no module claims. Both fail. Files change
  every day while the module list changes twice a year, so the first one warns
  constantly and gets ignored. The second assumes one folder is one module, which
  is false. A module is a judgment about meaning, and no file signal tells you
  when that changed.
- **Tracks are not modules.** A track is a kind of effort (`distribution`,
  `docs`). A module is a part of the product (the skill, the local UI, the site).
  One task has both. They stay separate axes — see #34.
- **The map is not memory.** `memory.md` is prose an agent writes while scanning,
  and the prune flow splits and merges it at will. `modules.md` is parsed by the
  script, so the prune flow would mangle it.

## Todo

- [ ] Write `references/module-map.md` — what counts as a module, one line each,
      and the repair rules: what to do when a line disagrees with the repo
- [ ] Make the generated `modules.md` open with the reader-repairs line: "If a
      line here disagrees with the repo you just read, fix the line."
- [ ] Add a step to `INSTALL_PROMPT.txt`, after `init` and before "propose the
      first 3 tasks". Reuse the repo analysis from step 3 instead of scanning
      again. The file is served from `web/public/`, so this needs a site deploy.
- [ ] Add `modules.md` to the Layout list in SKILL.md, plus a short section
      pointing at `references/module-map.md` for a rebuild
- [ ] Make `propose.md` step 1 read the map for focus candidates, and cross it
      against the repo scan first — delete or rename lines it cannot find
- [ ] Make propose still work with no map, falling back to what it does today —
      every install that already exists has no map
- [ ] Add a step to `references/update.md`: if there is no map, build one

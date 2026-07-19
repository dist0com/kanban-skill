# Updating the skill

How to pull a newer version of the kanban skill into a project that already has it
installed. The install copies this file in with the skill, so it's already here — point your
agent at it and follow the steps below; nothing needs to be fetched from upstream first.

## The one rule

**`config.md` is yours; everything else is upstream's.** Because the per-project settings
live only in `config.md`, an update can overwrite every other file wholesale and never has
to merge anything. Two things are off-limits to an update:

- `config.md` — your project's settings.
- `docs/kanban/` — your board data (cards, ids, metrics, memory).

Everything else in `.claude/skills/kanban/` is generic and safe to replace.

## What an update does

1. **Clone upstream** to a temp dir, same as install:

   ```
   git clone https://github.com/dist0com/kanban-skill /tmp/kanban-skill-update
   ```

2. **Show what changed.** Read the installed version and stamp:

   ```
   node .claude/skills/kanban/kanban.mjs version
   ```

   The `.version` stamp holds the source SHA the current copy came from. Summarise the
   delta in plain language before writing anything:

   ```
   git -C /tmp/kanban-skill-update log --oneline <stamped-sha>..HEAD -- skill kanban-ui
   ```

   If there's no stamp (installed before versioning), just describe the notable changes
   from the recent log.

3. **Overwrite the generic files.** Copy them from `/tmp/kanban-skill-update/skill/` over
   `.claude/skills/kanban/`, but **skip `config.md`**:

   - `kanban.mjs`
   - `SKILL.md`
   - `references/` (whole folder)

   A safe way to do this without clobbering `config.md`:

   ```
   cp /tmp/kanban-skill-update/skill/kanban.mjs .claude/skills/kanban/kanban.mjs
   cp /tmp/kanban-skill-update/skill/SKILL.md   .claude/skills/kanban/SKILL.md
   cp -R /tmp/kanban-skill-update/skill/references/. .claude/skills/kanban/references/
   ```

4. **Reconcile `config.md` only if the template gained a field.** Diff the fresh template
   against your filled-in copy:

   ```
   diff /tmp/kanban-skill-update/skill/config.md .claude/skills/kanban/config.md
   ```

   If upstream added a **new** setting (a new `{{PLACEHOLDER}}` or bullet), add just that
   line to your `config.md` and fill it — ask the user only for the new value. If nothing
   new appeared, leave `config.md` exactly as it is.

5. **The board UI updates itself from npm.** It's published as `kanban-skill-ui` and run with
   `npx`, so there's nothing in the project to update. `npx` caches by version, so to pick up
   a new release run `npx kanban-skill-ui@latest` once (later plain `npx kanban-skill-ui`
   runs reuse it). Its only per-project state, `docs/kanban/ui.config.json`, is board data
   and is never touched. Only a project that keeps a copied `kanban-ui/` source (contributors)
   needs the section below.

6. **Re-stamp and verify.** Write the new `.version` and confirm the board still resolves:

   ```
   printf 'sha: %s\ndate: %s\n' "$(git -C /tmp/kanban-skill-update rev-parse HEAD)" "$(date +%F)" \
     > .claude/skills/kanban/.version
   node .claude/skills/kanban/kanban.mjs peek
   node .claude/skills/kanban/kanban.mjs version
   ```

7. **Hand the diff to the user.** The repo is the safety net — tell them to review
   `git diff` (or `git status`) before committing. An update never writes to
   `docs/kanban/`, so any change there means something went wrong.

## Updating a copied `kanban-ui/` source (contributors only)

Most projects run the UI with `npx kanban-skill-ui` and never hold a copy — for them there's
nothing to update here. Only touch this if the project keeps a `kanban-ui/` source folder
(someone hacking on the UI itself). The agent connector no longer lives here — it moved to
`docs/kanban/ui.config.json` with the board, which an update never touches. So just re-copy
the source:

```
# re-copy source, dropping build + deps
rsync -a --delete --exclude node_modules --exclude .next \
  /tmp/kanban-skill-update/kanban-ui/ kanban-ui/
cd kanban-ui && npm install
```

If `rsync` isn't available, `cp -R` the source in and re-drop `node_modules`/`.next` before
`npm install`.

## Notes

- The update is idempotent — safe to re-run.
- It doesn't need the plugin path. Even if the skill was installed via
  `/plugin install kanban@kanban`, the editable copy under `.claude/skills/kanban/` is what
  runs, and that's what this updates.

# Updating the skill

Pull a newer version of the kanban skill into a project that already has it. This file
ships with the skill, so it's already here — just follow the steps; nothing needs to be
fetched first.

**The one rule: `config.md` (your settings) and `docs/kanban/` (your board data) are
yours; every other file in `.claude/skills/kanban/` is upstream's and gets overwritten
wholesale. Nothing is ever merged.**

## Steps

1. **Clone upstream** to a temp dir:

   ```
   git clone https://github.com/dist0com/kanban-skill /tmp/kanban-skill-update
   ```

2. **Show what changed.** `node .claude/skills/kanban/kanban.mjs version` prints the
   `.version` stamp — the source SHA the current copy came from. Summarise the delta in
   plain language before writing anything:

   ```
   git -C /tmp/kanban-skill-update log --oneline <stamped-sha>..HEAD -- skill kanban-ui
   ```

   No stamp (installed before versioning)? Describe the notable recent changes instead.

3. **Overwrite the generic files, skipping `config.md`:**

   ```
   cp /tmp/kanban-skill-update/skill/kanban.mjs .claude/skills/kanban/kanban.mjs
   cp /tmp/kanban-skill-update/skill/SKILL.md   .claude/skills/kanban/SKILL.md
   cp -R /tmp/kanban-skill-update/skill/references/. .claude/skills/kanban/references/
   ```

4. **Reconcile `config.md` only if the template gained a field:**

   ```
   diff /tmp/kanban-skill-update/skill/config.md .claude/skills/kanban/config.md
   ```

   If upstream added a new setting (a new `{{PLACEHOLDER}}` or bullet), add just that
   line and ask the user only for the new value. Otherwise leave `config.md` untouched.

5. **The board UI updates itself from npm** — it runs via `npx kanban-skill-ui`, so
   there's nothing in the project to update. To pick up a new release run
   `npx kanban-skill-ui@latest` once. Its only per-project state,
   `docs/kanban/ui.config.json`, is board data and is never touched.

6. **Build the module map if it's missing.** If `docs/kanban/modules.md` doesn't exist,
   write it by following `references/module-map.md`. If it exists, leave it — readers
   keep it current.

7. **Re-stamp and verify:**

   ```
   printf 'sha: %s\ndate: %s\n' "$(git -C /tmp/kanban-skill-update rev-parse HEAD)" "$(date +%F)" \
     > .claude/skills/kanban/.version
   node .claude/skills/kanban/kanban.mjs peek
   node .claude/skills/kanban/kanban.mjs version
   ```

8. **Hand the diff to the user** — tell them to review `git diff` before committing. An
   update never writes to `docs/kanban/`; any change there means something went wrong.

The update is idempotent — safe to re-run. It doesn't need the plugin path: even after
`/plugin install`, the editable copy under `.claude/skills/kanban/` is what runs.

## Updating a copied `kanban-ui/` source (contributors only)

Most projects run `npx kanban-skill-ui` and hold no copy. Only if the project keeps a
`kanban-ui/` source folder (someone hacking on the UI itself), re-copy it:

```
rsync -a --delete --exclude node_modules --exclude .next \
  /tmp/kanban-skill-update/kanban-ui/ kanban-ui/
cd kanban-ui && npm install
```

If `rsync` isn't available, `cp -R` the source in and re-drop `node_modules`/`.next`
before `npm install`.

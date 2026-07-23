---
title: Fold propose into the create-task dialog, with a module picker
track: features
priority: high
roi: high
status: todo
blocked_by: []
related: []
modules: []
questions:
  - "Sequence the --modules script work vs. #34: make #38 blocked_by #34 (land #34's flag first, mirrors #39 — recommended), or absorb #34's --modules work into #38 to ship together? Priorities call for the user."
---

Add "propose" to the UI by folding it into Create task, so add-task and propose are one path. The UI has no way to propose today.

## Today
- Create task is one dialog: a textarea plus a "Create task" button (the `create` branch of `ActionDialog` in `agent-shared.tsx`).
- `buildPrompt`'s `create` case sends the add-task flow. There is no propose action anywhere in the UI.
- Propose (see `references/propose.md`) picks ONE module and proposes 3 new tasks inside it. The UI can't do this.

## Scope
- Add a toggle to the Create-task dialog: "let AI automatically propose 3 tasks".
- When the toggle is ON, hide the textarea. There is nothing to describe — the agent proposes.
- Show a single-module dropdown in both modes — pick one module, or none. The names come from `docs/kanban/modules.md` (the bolded name on each line).
- Read `modules.md` server-side and pass the bolded names to the client dialog. It has no machine-readable source in the UI today.
- For normal add-task, the picked module is written to the card's `modules:` frontmatter (needs the `--modules` script flag — see "Still to decide"). For propose, the pick tells the agent which module to focus; if none is picked, the agent picks the focus itself.
- Keep it MVP. One toggle, one module list. Don't over-build.

## Todo
- [ ] Add a server-side read of `docs/kanban/modules.md` that returns the bolded module names, and pass them to the dialog.
- [ ] Add the "let AI automatically propose 3 tasks" toggle to the create dialog in `agent-shared.tsx`.
- [ ] Hide the textarea when the toggle is on.
- [ ] Add the single-module dropdown, shown in both modes.
- [ ] Add `propose` as its own `AgentAction`: the union in `lib/types.ts`, the `ACTIONS` set in `app/actions.ts`, the `RUNNING_VERB` map ("proposing"), and a new `buildPrompt` case that follows `references/propose.md` and passes the picked module.
- [ ] Make sure a propose session is labelled correctly in the sessions panel (falls out of the own-action decision above).
- [ ] Pass the picked module to add-task via the `--modules` script flag (blocked on #34 — see "Still to decide").
- [ ] Update `kanban-ui/README.md` — propose is a new user-facing action.

## Decisions
- **Propose scope with the picker.** One module only — a dropdown, not a multi-select. Propose runs once on the one picked module (3 tasks). No per-module fan-out.
- **Is the module pick required?** No. The dropdown lets you pick one module or none. On propose with none picked, the agent picks the focus itself (per `references/propose.md`: "If they leave it open, pick one yourself"). On add-task it stays optional.
- **Where `modules.md` is parsed.** Server-side, in the UI: a new reader (e.g. `kanban-ui/lib/modules.ts`) reads `docs/kanban/modules.md` and returns only the bolded name at the front of each `- **name** — …` line, exposed to the client dialog through a server action in `app/actions.ts` (the same shape as `getBoard`). Only the bolded names are used.
- **Propose as its own action.** Yes — a distinct `AgentAction` `propose`, not a flag on `create`. The sessions panel labels every session by its `action` (`RUNNING_VERB[action]`, the overlay title), so a distinct action is what makes a propose session read "proposing" instead of "creating".
- **Add-task modules → frontmatter.** Write the picked module to the card's `modules:` frontmatter via a `--modules` flag on the create script — not just a prompt hint. (See "Still to decide" for the one thing this depends on.)

## Still to decide
- **How to sequence the `--modules` script work vs. #34.** Writing add-task's picked module to frontmatter needs a `--modules` flag on `create`/`update` in `kanban.mjs` — and that flag is the core scope of task **#34** ("Tag each task with the modules it touches"). #39 already sits `blocked_by: [34]` for the same reason. So either (a) make #38 `blocked_by: [34]` and land #34's flag first — recommended, it keeps task boundaries clean and mirrors #39 — or (b) absorb #34's `--modules` script work into this #38 session to ship both together. This is a priorities call, so it's left for the user.

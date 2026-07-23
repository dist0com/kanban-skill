# Decisions

Settled answers to cards' open questions — the question, then the answer, once resolved.
The resolve flow appends here. Read before proposing so you don't re-ask a settled call.

## Memory set

- **How far does "stop maintaining archive.md" go — keep it in the set but unwritten, or
  remove it entirely?** Remove it entirely (option B, the full clean break). The memory
  set drops from six files to five; `archive.md` leaves `init`/`memory-init`, propose
  reads the published docs + `readme.md` instead, and today's `archive.md` lines are
  migrated into the docs before the files are deleted. This reverses the six-file
  decision from #31/#36 — a file nothing writes is exactly the leftover we avoid.

## Create task + propose (#38)

- **Propose scope when several modules are picked — one focus, per-module fan-out, or
  agent-choose?** One module only. The picker is a single-module dropdown, not a
  multi-select; propose runs once on the one picked module (3 tasks).
- **Is the module pick required for propose, and optional for add-task?** Not required for
  either. The dropdown takes one module or none. On propose with none picked, the agent
  picks the focus itself (`references/propose.md`). On add-task it's optional.
- **Where is `modules.md` parsed for the dialog?** Server-side in the UI: a reader (e.g.
  `kanban-ui/lib/modules.ts`) reads `docs/kanban/modules.md` and returns only the bolded
  name at the front of each line, exposed to the client through a server action in
  `app/actions.ts` (same shape as `getBoard`).
- **Is propose its own `AgentAction` or a flag on `create`?** Its own action, `propose`.
  The sessions panel labels each session by its `action` (`RUNNING_VERB`, the overlay
  title), so a distinct action is what labels a propose session correctly. Wire it into the
  `AgentAction` union (`lib/types.ts`), the `ACTIONS` set (`app/actions.ts`), `RUNNING_VERB`,
  and a new `buildPrompt` case.
- **How do add-task's picked modules reach the card — prompt hint or script flag?** Write
  them to the card's `modules:` frontmatter via a `--modules` flag on the create script, not
  a prompt hint. That flag is task #34's core scope (#39 already `blocked_by: [34]`), so
  #38's frontmatter-write depends on #34 landing the flag.

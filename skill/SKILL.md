---
name: kanban
description: Use to propose new tasks, add a task, mark one done, or push a task one step forward. Manages the file-based task board in docs/kanban/ — blockers, roadmap tracks, archive, and global task ids. Triggers on "propose new tasks", "what's on the backlog", "add a task", "this is done", "refine", "resolve", "dive deeper".
argument-hint: "[propose | add <task> | refine <id> | resolve <id> | done <id> | reject <id>]"
---

The task board lives in `docs/kanban/`. Read it before suggesting or adding work.

## Configuration

**Read `config.md` first** — it carries your project's settings: name, tracks, planning
sources, reference docs, optional preset. The install step fills it in; until then its
defaults apply. It's the only file here an update leaves untouched — everything else
(`SKILL.md`, `kanban.mjs`, `references/`) is generic, owned by upstream, and overwritten
wholesale (see "Updating the skill"). Where this doc says "your tracks", "your planning
sources", or "your reference docs", it means the values in `config.md`.

## Writing style

Write every card in simple, clear, short language — say what to do and why it matters.
No jargon, no business-speak, no clever phrasing. A non-native reader skimming should
get it in one pass.

- Bad: "Price it as a monthly retainer for an outcome stream."
- Good: "Charge $300/month. The user gets a brief each week and a report each month."

## Layout

```
docs/kanban/
├── todo/           open tasks
│   ├── README.md   the index — read it first
│   ├── blockers/   hard blockers; they gate the next milestone — clear them first
│   ├── <track>/    one folder per track (see Configuration), one card per file
│   └── recurring/  jobs on a cadence (see "Recurring task") — one card per file,
│                   never archived
│   the five-file memory set (see "The memory set") — the umbrella copy at the board root:
├── readme.md       current status — watermarks, last focus, open gaps; refreshed each scan.
│                   Also the holding pen for shipped user-facing behavior no published doc covers yet
├── goal.md         the project's direction, in the user's words — user-owned
├── decisions.md    settled answers to cards' open questions — the resolve flow appends here
├── rejected.md     ideas we said no to, by product area — one line each: the idea
│                   and why. Rejecting is rare; focus this file on what to avoid
├── redesign.md     design mistakes, by product area — each entry: the mistake,
│                   then the design we actually want
├── memory/<module>/  a module's own copy of the same five-file set, keyed by its name in
│                   modules.md, made lazily on the first write (see "The memory set")
├── modules.md      one line per module — install writes it, the propose flow
│                   reads it to pick a focus area (see "The module map")
├── next-id         the next free task id — NEVER edit by hand; only the script
│                   writes it (see "The script")
└── metrics.csv     one row per day: completed, created, rejected — the script
                    keeps it; you never touch it
```

Before proposing, read the published docs (your reference docs, see Configuration),
`readme.md`, and `rejected.md` so you don't re-suggest shipped or rejected work — shipped
behavior lives in the docs (with `readme.md` as the holding pen until a doc covers it), not
in a separate archive. Before writing or reviewing a card, read `redesign.md` so a new card
doesn't repeat a wrong plan.

## The script

`.claude/skills/kanban/kanban.mjs` is the **only** sanctioned way to scaffold the board,
create, update, migrate, archive, or reject a task. It allocates ids, writes and rewrites a
card's **frontmatter**, moves/removes task files, keeps the README index, and records the
daily metric. Set `KB="node .claude/skills/kanban/kanban.mjs"` once and run every command from
the repo root as `${KB} <command>`:

```
${KB} init [track...]               # scaffold docs/kanban/ (tracks default to feature bug research)
${KB} create [--count N]            # allocate N ids (default 1), prints them
${KB} create --title ".." --track <track> [--priority high|med|low] [--roi high|med|low] \
             [--blocked-by 1,2] [--related 3] [--question ".."] [--slug ..]
                                    # scaffold ONE card: frontmatter + body template + README entry; then fill only the body
${KB} update <id> [--priority ..] [--roi ..] [--track ..] [--slug ..] \
             [--blocked-by ..] [--related ..] [--question ..] [--clear-questions]
                                    # rewrite a card's frontmatter; --track moves it, --slug renames
${KB} archive <id>                  # finish task <id>
${KB} reject  <id>                  # reject task <id>
${KB} run     <id>                  # record one run of recurring task <id> (card kept)
${KB} peek                          # current next-id, no bump
${KB} help                          # full usage
```

The script validates every value — unknown track, bad priority/roi, invented `#id`, or a
mistyped flag are hard errors, so a hallucinated field can't slip into a card.

**Never hand-write a card's frontmatter.** Use `create`/`update` for the meta
(title, track, priority, roi, blocked_by, related, questions); use Write/Edit only for the
card **body** (summary, scope, todos).

## Task id

Every task's id is the number at the front of its filename (`04-plan-cap-enforcement.md` →
id 4). Ids are global and never reused; only the script's `create` allocates them.

## Propose new tasks

When the user asks to propose work ("propose new tasks", "propose work in <area>", "dive
deeper"), pick **one focus area** and propose **3 new tasks inside it** — work nobody has
planned yet. Full guide in `references/propose.md`.

## Add a task

Add a task from an idea: resolve the modules it touches and read their memory, review
the idea, scaffold the card with the script, have a subagent write the body, review
the written card, then refine it once. Never drop a task without asking the user a
question first. Full guide in `references/add-task.md`.

## Review a task

Follow `references/task-review.md`. Reviewing multiple? Spawn one
subagent per card in parallel.

## Refine

Take one task and move it one step forward — from vague to concrete. A refine is two
substeps: **review** the card (missing steps, missed edge cases, over-complication,
actionability — yielding open questions for the user and revisions you decide
yourself), then **rewrite** it (push one stage only, apply the revisions, split off
side ideas, stop at the code level). A refine that ends with a concrete plan and no
open questions marks the card `ready` — the user scans for the `ready` pill to pick
what to implement next. Full guide in `references/refine.md`.

A card with unresolved `questions` in its frontmatter can't be refined — resolve the
questions first.

## Resolve open questions

When a card carries open `questions`, resolving them is the only way to move it
forward. Research each one, decide it yourself when the evidence settles it, ask the
user when it's a judgment call, write the answers into the card, and clear the list
with the script. Append each user-facing decision, in minimal plain words, to
`decisions.md` — the board-root copy, plus the copy of any module the card names — so
a later loop doesn't re-ask; internal details stay on the card. Full guide in
`references/resolve.md`.

## Group task

Most tasks are one file. A **group task** is a broad task whose split yields subtasks
that *themselves* need splitting — a dividable of a dividable. It lives in its own
folder, not a single card:

```
todo/<id>-<short-slug>/
  root.md                            # the tracking task
  <track>/<subid>-<slug>.md          # a subtask, its own card, under any track folder
```

The root takes one new id; each subtask takes its own id — allocate them together with
`${KB} create --count <N>` (root + subtasks). Wire them up
with the script's flags: each subtask is **Related** to the root, and **Blocked by**
between subtasks that must run in order.

## Finish a task

One-shot tasks only — a recurring card is never finished this way; each run uses
`run <id>` and keeps the card (see "Recurring task").

Record what shipped where the record belongs — the published doc, not a separate archive:

1. **Only user-facing behavior.** If the change is internal-only (nothing a user can see
   or do), record nothing — don't keep an internal note.
2. **A published doc covers it → the doc is the record.** The card already carries todos to
   update the docs it touches (the "Document a change" flow); those todos write the doc.
   Don't add a second doc-writing path here — just make sure those todos are done.
3. **No published doc yet → hold it in `readme.md`.** Put the user-facing behavior in
   `readme.md` as a holding pen, in plain words — **what the user can now do**, no task ids,
   file names, migrations, function names, or other code detail. Drop that entry once a
   published doc covers the behavior; a leftover copy or link is the second copy we avoid.

The holding-pen entry goes in the board-root `readme.md`. If the card names a module in its
`modules:` field, hold it in that module's copy (`docs/kanban/memory/<module>/readme.md`)
instead — run `${KB} memory-init <module>` first so the set exists (names two? write both).
A card with no module, or an umbrella-wide change, uses the board-root copy (see "The
memory set").

Then run `${KB} archive <id>` — it removes the card file
(or the whole folder for a group root), strips its README entry, and records the completion.

## Reject an idea

Rejecting is rare. When you (or the user) turn down an idea, add a short line to
`docs/kanban/rejected.md` under the topic that fits — start a new topic heading if none
fits. One bolded idea name, then one plain line on why we said no:

```
## <topic>
- **<idea name>** — <why we said no, one line>.
```

Write it to the board-root `rejected.md`. If the idea's card names a module in its
`modules:` field, also append the same line to that module's copy
(`docs/kanban/memory/<module>/rejected.md`) — `${KB} memory-init <module>` first (see "The
memory set").

If the idea already had a card, run `${KB} reject <id>` —
it removes the card file (or folder), strips its README entry, and records the rejection.

## Record a redesign

When the user corrects a card that missed a requirement or got the design wrong, add a
short entry to `docs/kanban/redesign.md` under the topic that fits — start a new topic
heading if none fits. One bolded name for the mistake, then one plain line on the design we
actually want. This is a guide for the next card, not a record of the fix — say what to do
right, not what went wrong:

```
## <topic>
- ❌ **<mistake>** → ✅ <what the design should be instead, one line>.
```

Write it to the board-root `redesign.md`. If the corrected card names a module in its
`modules:` field, also append the same entry to that module's copy
(`docs/kanban/memory/<module>/redesign.md`) — `${KB} memory-init <module>` first (see "The
memory set").

## The tracks

Your tracks (Configuration) are the buckets a task lives in, each with a rough share of
effort. Balance new work across them instead of pouring everything into one. The default
tracks:

- **feature (60%)** — build what moves the product forward. Stay at MVP; don't over-build.
  Build when it scales work you'd otherwise do by hand, strengthens the product, or is
  strongly demanded by users.
- **bug (25%)** — fix what's broken or rough. A blocker bug goes in `blockers/`.
- **research (15%)** — learn before you build: spikes, benchmarks, checking that a
  direction is worth the effort before committing deep.

Swap these for your project's real tracks during install. For a solo product launch, the
`indie-hacker` preset (`references/presets/indie-hacker.md`) replaces them with
growth / validation / building.

## Recurring task

A **recurring task** is a job we repeat on a cadence (e.g. a weekly report), not a one-shot
we finish and archive. Its card lives in `todo/recurring/`, sets `track: recurring` in the
frontmatter, and carries two extra sections:

- `## Process` — the distilled, in-order steps of one run. Tag each step by how it runs
  today: `[script]` a command to run, `[agent]` an instruction the agent follows, `[ask]`
  a step that still needs the user. The point of the type is to move steps up the ladder
  over time (`[ask]` → `[agent]` → `[script]`) until a run needs no human.
- `## Runs` — points to the per-run open-questions files (below).

**Finishing a run** (not the whole task):

1. Run the job by following `## Process`.
2. Record it: `${KB} run <id>` — this adds +1 to
   `completed` and **keeps the card** (no archive, no README change). It refuses if the
   card isn't under `todo/recurring/`.
3. **Self-improve.** Collect what happened this run and rewrite `## Process` so the next
   run needs less human effort: turn a manual step into an `[agent]` instruction, or an
   `[agent]` step into a `[script]` step with a real command. This is the whole point —
   each run should be more automatic than the last.
4. **Log what still needed a human.** For any step the agent couldn't do alone, ask the
   user and save the answers in `runs/<YYYY-MM-DD>-open-questions.md` inside a folder next
   to the card (`todo/recurring/<id>-<slug>/runs/`). Before the next run, fold answered
   questions back into `## Process` and delete them; a run file that empties out means that
   step is now automatic.

Full guide in `references/recurring-task.md`.

## Run the board locally

Optional: a small local UI to drive the board from buttons instead of the terminal. Run it
from your repo root with `npx kanban-skill-ui` (localhost only). Full guide in
`references/local-ui.md`.

## Updating the skill and local UI

Pulling a newer version into a project you already installed it in. Full guide in `references/update.md`.

## The module map

`docs/kanban/modules.md` lists what parts the project is made of — the skill, the local
UI, the site — one line per module. Install writes it, and the propose flow reads it to
pick a focus area. It stays true by one rule: whoever reads it and sees a line disagree
with the repo fixes that line in the same run. To write it from scratch or rebuild it,
follow `references/module-map.md`.

## The memory set

The project's memory is a **fixed set of five files**, held at two levels. Every memory path
— the board root and each module's own path — holds the same five:

- **`readme.md`** — current status: where this stands now. Watermarks (when each source was
  last reviewed), the last focus, the open gaps. Also the **holding pen** for shipped
  user-facing behavior no published doc covers yet (see "Finish a task"). The agent
  overwrites it during a scan.
- **`goal.md`** — the direction, in the user's words. One short statement. The user owns it;
  the agent seeds a template but never invents the goal.
- **`decisions.md`** — settled answers to cards' open questions. The resolve flow appends
  the user-facing ones, in minimal plain words, once cleared, so a later loop doesn't
  re-ask.
- **`redesign.md`** — design mistakes to avoid.
- **`rejected.md`** — ideas we turned down, and why.

Shipped work is **not** in the set: the published doc is its record (see "Finish a task"),
with `readme.md` holding anything not yet documented.

**Two levels, side by side.**

- **Umbrella (board root, `docs/kanban/`).** The umbrella copy covers work that spans the
  whole project. `init` writes all five here when it scaffolds the board.
- **Per module (`docs/kanban/memory/<module>/`).** Each module named in the map (keyed by
  its bolded name in `modules.md`) gets its own copy of the same five, so one part's notes
  don't bury the rest. Module copies sit **beside** the umbrella copy — they never replace
  it.

**Lazy creation.** A module with no notes yet has no folder. The whole set appears at once
the first time something writes to that module's memory — run
`${KB} memory-init <module>` to scaffold it (idempotent), then write. Never pre-create the
set for every listed module.

**Which copy a write lands in.** The card's `modules:` field decides: a card that names a
module writes that module's copy (both, if it names two); a card with no module, or an
umbrella-wide change, writes the board-root copy. The flows that write memory —
"Finish a task" (holds undocumented behavior in `readme.md`), "Reject an idea"
(`rejected.md`), "Record a redesign" (`redesign.md`), "Resolve open questions"
(`decisions.md`), and propose (`readme.md`) — all follow this rule.

**Propose reads the focus.** When propose picks a focus module, it reads that module's set,
not the whole board — so working on one part shows that part's notes. With no focus module
or no module map, it reads the umbrella set.

## Auto-pruning

To compress the memory set — `readme.md`, `decisions.md`, `rejected.md` and
`redesign.md`, at the board root and in each module copy — down to planning-useful
summaries, follow `references/prune-memory.md`.

## Document a change

A card that ships something users can see carries todos to update the docs it touches, so
the change isn't hidden. Follow `references/document-feature.md` — it maps a change to the
surfaces in your reference docs (Configuration) that need updating. If you keep no such
docs, this step is a no-op.

## Refs

- your roadmap doc (Configuration) — product direction.
- your user-facing docs (Configuration) — what you promise and teach users.
- `references/presets/` — optional bundles that add tracks and reviews for a specific
  kind of project (e.g. `indie-hacker.md`).

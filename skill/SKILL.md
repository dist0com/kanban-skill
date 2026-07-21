---
name: kanban
description: Use to pick the next things to work on, add a task, mark one done, or push a task one step forward. Manages the file-based task board in docs/kanban/ — blockers, roadmap tracks, archive, and global task ids. Triggers on "what's next", "next thing to do", "add a task", "what's on the backlog", "this is done", "refine", "resolve", "dive deeper".
argument-hint: "[next | add <task> | refine <id> | resolve <id> | done <id> | reject <id>]"
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

- `docs/kanban/todo/` — open tasks.
  - `README.md` — the index. Read it first.
  - `blockers/` — hard blockers. These gate the next milestone. Clear them first.
  - one folder per track (see your tracks in Configuration), one card per file.
  - `recurring/` — jobs we repeat on a cadence (see "Recurring task"). Its own folder
    parallel to the track folders; one card per file, and they never archive.
- `docs/kanban/archive.md` — shipped work, grouped by product area (topics), in plain
  language. No task ids. Read before proposing so you don't re-suggest shipped work.
- `docs/kanban/rejected.md` — ideas we turned down, grouped by product area (topics).
  One line each: the idea, and why we said no. No task ids. Read before proposing so you
  don't re-suggest them. Rejecting is rare; focus this file on what to avoid.
- `docs/kanban/redesign.md` — design mistakes to avoid when writing a card, grouped by
  product area (topics). One entry each: the mistake, then the design we actually want.
  Read before writing or reviewing a card so a new card doesn't repeat a wrong plan.
- `docs/kanban/memory.md` (or `docs/kanban/memory/*.md`) — short notes from past scans,
  written from the user's standpoint, so a new loop builds on them.
- `docs/kanban/next-id` — one number: the next free task id. **Never edit by hand** —
  only the script writes it (see "The script").
- `docs/kanban/metrics.csv` — one row per day: completed, created, rejected. The script
  keeps it; you never touch it.

## The script

`.claude/skills/kanban/kanban.mjs` is the **only** sanctioned way to scaffold the board,
create, update, migrate, archive, or reject a task. It allocates ids, writes and rewrites a
card's **frontmatter**, moves/removes task files, keeps the README index, and records the
daily metric. Run it from the repo root with `node`:

```
node .claude/skills/kanban/kanban.mjs init [track...]       # scaffold docs/kanban/ (tracks default to feature bug research)
node .claude/skills/kanban/kanban.mjs create [--count N]    # allocate N ids (default 1), prints them
node .claude/skills/kanban/kanban.mjs create --title "..." --track <track> [--priority high|med|low] \
     [--roi high|med|low] [--blocked-by 1,2] [--related 3] [--question "..."] [--slug ...]
                                                            # scaffold ONE card: writes its frontmatter + a body
                                                            # template + the README entry. Then fill only the body.
node .claude/skills/kanban/kanban.mjs update <id> [--priority ..] [--roi ..] [--track ..] [--slug ..] \
     [--blocked-by ..] [--related ..] [--question ..] [--clear-questions]
                                                            # rewrite a card's frontmatter; --track moves it, --slug renames
node .claude/skills/kanban/kanban.mjs archive <id>          # finish task <id>
node .claude/skills/kanban/kanban.mjs reject  <id>          # reject task <id>
node .claude/skills/kanban/kanban.mjs run     <id>          # record one run of recurring task <id> (card kept)
node .claude/skills/kanban/kanban.mjs peek                  # current next-id, no bump
node .claude/skills/kanban/kanban.mjs help                  # full usage
```

The script validates every value — unknown track, bad priority/roi, invented `#id`, or a
mistyped flag are hard errors, so a hallucinated field can't slip into a card.

**Never hand-write a card's frontmatter.** Use `create`/`update` for the meta
(title, track, priority, roi, blocked_by, related, questions); use Write/Edit only for the
card **body** (summary, scope, todos).

## Task id

Every task's id is the number at the front of its filename (`04-plan-cap-enforcement.md` →
id 4). Ids are global and never reused; only the script's `create` allocates them.

## Propose the next things to do

Each loop picks **one focus area** and proposes **3 new tasks inside it** — work nobody
has planned yet. Ideas come from walking a user story in that area step by step and
noting every stumble, not from a roadmap. Don't scatter three unrelated ideas; dig one
area deep so its gap actually closes, and pick a different focus next loop. Keep what you
learn in `docs/kanban/memory.md` so the next loop builds on it. Full guide in
`references/propose.md`.

## Add a task

Review before writing, then again after. Both passes use `references/task-review.md`;
on a fail, ask the user a question about what it flagged, then decide from the answer
whether to proceed or drop it. Never drop a task without asking a question first.

1. **Review the idea first** — business necessity, feasibility, feature value,
   duplication. Read `docs/kanban/redesign.md` and drop or fix any design it warns
   against. Only proceed if it passes (or the user's answer says to).
2. **Scaffold the card, then write its body.** Create the card and its frontmatter with
   `create --title "..." --track <track>` (add `--priority`, `--roi`, `--blocked-by`,
   `--related`, `--question` as needed) — this writes the file, its meta, and the README
   entry. Then spawn a subagent with `references/add-task.md` and the file path; it fills in
   only the **body** (summary, scope, todos) with Write/Edit and leaves the frontmatter
   alone. Adding three tasks? Run `create` three times (each returns its id) and spawn three
   subagents in parallel.
3. **Review the written card** — plain language, todos split, unambiguous plan. Keep it
   if it passes.

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
with the script. Full guide in `references/resolve.md`.

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
`node .claude/skills/kanban/kanban.mjs create --count <N>` (root + subtasks). Wire them up
under "Relationships": each subtask is **Related** to the root, and **Blocked by** between
subtasks that must run in order. Full spec in `references/add-task.md`.

## Finish a task

One-shot tasks only — a recurring card is never finished this way; each run uses
`run <id>` and keeps the card (see "Recurring task").

Don't keep the full card — it just wastes tokens on future scans. Rewrite it down
to a 1-2 line note and add it to `docs/kanban/archive.md` under the topic that fits
— start a new topic heading if none fits. Say **what the user can now do**, in plain
words. No task ids, file names, migrations, function names, or other code detail:

```
## <topic>
- <what the user can now do, 1-2 plain lines>
```

Then run `node .claude/skills/kanban/kanban.mjs archive <id>` — it removes the card file
(or the whole folder for a group root), strips its README entry, and records the completion.

## Reject an idea

Rejecting is rare. When you (or the user) turn down an idea, add a short line to
`docs/kanban/rejected.md` under the topic that fits — start a new topic heading if none
fits. One bolded idea name, then one plain line on why we said no:

```
## <topic>
- **<idea name>** — <why we said no, one line>.
```

If the idea already had a card, run `node .claude/skills/kanban/kanban.mjs reject <id>` —
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
2. Record it: `node .claude/skills/kanban/kanban.mjs run <id>` — this adds +1 to
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

## Auto-pruning

To compress `memory.md`, `archive.md`, `rejected.md` and `redesign.md` down to
planning-useful summaries, follow `references/prune-memory.md`.

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

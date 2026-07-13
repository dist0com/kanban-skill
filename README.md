# kanban — a file-based task board Claude runs for you

A Claude Code skill that lets Claude run your backlog for you — proposing the next work,
writing the cards, and archiving what's done. Your backlog lives as plain Markdown files in `docs/kanban/`
— in git, diffable, readable by both you and the agent. No database, no web app, no SaaS.

Ask Claude *"what's next?"* and it reads the board, proposes work grounded in your
codebase, and writes clear task cards. Say *"this is done"* and it archives the card and
records the metric. The board stays small because finished work is compressed to a
one-line note, not left to rot.

- **Propose** — 3 new tasks pulled from real gaps in your code and docs, never busywork.
- **Add** — self-contained cards in plain language, split into checkable todos.
- **Dive deeper** — push one card from vague to concrete, one stage at a time.
- **Finish / reject** — a single script allocates ids, removes cards, and keeps metrics.

It adapts to your project through a small **Configuration** block — your name, your
tracks, your docs. Everything else is generic.

## Install

The skill is two things: a `SKILL.md` that tells Claude how to run the board, and a tiny
`kanban.mjs` script (Node, no dependencies) that is the only thing allowed to allocate
ids and edit metrics.

Installing is one prompt — you don't copy files or edit config by hand. Your agent reads
your codebase, fills in the setup, and scaffolds the board for you.

### Recommended: let your agent install it

From your project root, tell Claude Code (or any coding agent that can run shell commands):

> Set up the kanban skill for this project. Read
> https://raw.githubusercontent.com/dist0com/kanban/main/INSTALL_PROMPT.txt and follow it.

The agent fetches [`INSTALL_PROMPT.txt`](INSTALL_PROMPT.txt), copies the skill into
`.claude/skills/kanban/`, reads your codebase to fill the **Configuration** block,
scaffolds the board under `docs/kanban/`, and proposes your first three tasks. It asks you
at most a couple of questions where it genuinely can't infer a value.

### Alternative: paste the prompt yourself

If your agent can't fetch URLs, open [`INSTALL_PROMPT.txt`](INSTALL_PROMPT.txt) and paste
its contents into the agent instead — same result.

That's the whole setup. From then on you just talk to the board.

### Requirements

- Claude Code (or any agent that can read skills and run shell commands).
- Node.js 18+ for `kanban.mjs` (standard library only — nothing to install).

## Using the board

Once installed, drive it in plain language — the skill triggers on these:

| You say | Claude does |
| --- | --- |
| "what's next?" | reads the board + your sources, proposes 3 new tasks |
| "add a task: …" | reviews the idea, writes a card, adds it to the index |
| "dive deeper on #4" | pushes card #4 one stage toward concrete |
| "review the board" | checks cards for clarity, duplication, done-ness |
| "#4 is done" | compresses it into `archive.md`, removes the card |

Under the hood, only `kanban.mjs` allocates ids or touches metrics:

```bash
node .claude/skills/kanban/kanban.mjs create [--count N]  # allocate ids
node .claude/skills/kanban/kanban.mjs archive <id>        # finish a task
node .claude/skills/kanban/kanban.mjs reject  <id>        # drop an idea
node .claude/skills/kanban/kanban.mjs run     <id>        # record one recurring-task run
node .claude/skills/kanban/kanban.mjs peek                # next free id
node .claude/skills/kanban/kanban.mjs metrics             # the daily CSV
```

See [the daily loop](docs/guides/daily-loop.md) for how to run the board day to day.

## What's in this repo

```
skill/                     # the distributable skill (this is what you install)
  SKILL.md                 #   how Claude runs the board (with {{PLACEHOLDERS}})
  kanban.mjs               #   the id/metrics bookkeeping script
  references/              #   deep-dive guides the skill loads on demand
    presets/               #   optional bundles (e.g. indie-hacker)
.claude/skills/kanban/     # this repo's own filled-in install (dogfooding)
docs/kanban/               # this repo's own board — a live example
docs/guides/               # usage guides
INSTALL_PROMPT.txt         # the one-shot install prompt agents read to set it up
.claude-plugin/            # plugin + marketplace manifests
PUBLISHING.md              # how the skill gets onto marketplaces
NOTICE                     # Apache attribution notice
LICENSE                    # Apache License 2.0
```

This repo **uses the skill on itself**: `docs/kanban/` is a real board tracking the
skill's own development, so you can see exactly what a filled-in setup looks like.

## Origin

Generalized from a kanban skill built for a single product ([dist0](https://dist0.com)).
The reusable version keeps the good bones — global ids, plain-language cards, the propose /
dive-deeper / archive loop, auto-pruning memory — and moves everything project-specific
into Configuration and presets.

## License

[Apache License 2.0](LICENSE). Free to use, modify, and redistribute. Contributions
welcome.

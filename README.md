# Kanban skill — organize your task board in Markdown, right next to your code

A skill that lets Claude Code does project management for you — proposing the
next work, writing the cards, and archiving what's done. It's a **task board in Markdown**: your
backlog lives as plain Markdown files in `docs/kanban/` — in git, diffable, readable by both
you and the agent. Instead of tracking work in GitHub Issues or Linear, you steer the
board in plain language, straight from your terminal — call it **vibe kanban** if you like. No
database, no web app, no MCP.

It adapts to your project through a small **Configuration** block — your name, your
tracks, your docs. Everything else is generic.

## Designed for solo founders

This skill is best suited for solo founders and small teams who don't want their work
scattered across Slack, GitHub, Notion, and a dozen other apps. Keep everything in one
place — your codebase — and you cut the context switching, the information silos, and the
tokens burned pulling state out of each app through MCP or screenshots.

For indie hackers, that means marketing, building, documentation, social proof, social
listening, and competitor tracking all living side by side in the same repo. When your
context isn't fragmented across tools, the LLM can compose across everything you have — and
that's where it does its best work.

## Tested with Claude Code + Opus

This skill is primarily developed and tested with **Claude Code** running an Opus-series
model, so that's the combination it works best with today. It's plain Markdown and a
dependency-free Node script under the hood, though, so nothing ties it to one agent. If you
run it with a different model — or a different coding agent entirely — we'd love your
feedback on how it holds up.

## Install

The skill is two things: a `SKILL.md` that tells Claude how to run the board, and a tiny
`kanban.mjs` script (Node, no dependencies) that is the only thing allowed to allocate
ids and edit metrics.

Installing is one prompt — you don't copy files or edit config by hand. Your agent reads
your codebase, fills in the setup, and scaffolds the board for you.

### Install as a plugin (one command)

The repo is its own plugin marketplace, so you can add and install it straight from Claude
Code:

```
/plugin marketplace add dist0com/kanban
/plugin install kanban@kanban
```

Or, through the [Vercel Agent Skills directory](https://skills.sh):

```
npx skills add dist0com/kanban
```

That makes the skill available to Claude. Then, in each project you want a board, tell
Claude **"set up the kanban skill for this project"** — it fills the **Configuration**
block from your codebase and scaffolds `docs/kanban/` (same as the prompt below).

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
node .claude/skills/kanban/kanban.mjs init [track...]     # scaffold a fresh board
node .claude/skills/kanban/kanban.mjs create [--count N]  # allocate ids
node .claude/skills/kanban/kanban.mjs archive <id>        # finish a task
node .claude/skills/kanban/kanban.mjs reject  <id>        # drop an idea
node .claude/skills/kanban/kanban.mjs run     <id>        # record one recurring-task run
node .claude/skills/kanban/kanban.mjs peek                # next free id
node .claude/skills/kanban/kanban.mjs metrics             # the daily CSV
```

See [the daily loop](docs/guides/daily-loop.md) for how to run the board day to day.

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

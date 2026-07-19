# Publishing the kanban skill

How this skill gets in front of people. Written against the Claude Code plugin/skill
ecosystem as of mid-2026 — it's young and moving fast, so verify specifics against the
[current docs](https://code.claude.com/docs/en/plugin-marketplaces) before you rely on
them.

## How Claude Code distribution actually works

- A **skill** is a directory with a `SKILL.md` (name + description in the frontmatter).
  Ours is `skill/`.
- To make a skill installable with a command, you bundle it in a **plugin** — a repo with
  `.claude-plugin/plugin.json` that lists its skills. Ours is at the repo root and lists
  `./skill`.
- A **marketplace** is just a git repo with `.claude-plugin/marketplace.json` cataloguing
  one or more plugins. This repo is its own marketplace.
- There is **no single official app store**. Discovery happens through the official plugin
  directory plus third-party sites that index public GitHub repos.

So this repo is, at once: the skill, the plugin, and a one-plugin marketplace. Users can
either copy the skill folder in by hand (see the README) or install it as a plugin.

## Channel 1 — this repo as an installable plugin (done)

Already wired up. Users run:

```
/plugin marketplace add dist0com/kanban-skill
/plugin install kanban@kanban
```

To keep it healthy:

- Validate before every release: `claude plugin validate .`
- Bump `version` in **all three** places on each release — `.claude-plugin/plugin.json`,
  `.claude-plugin/marketplace.json`, and `SKILL_VERSION` in `skill/kanban.mjs` (what
  `kanban.mjs version` prints, so installed projects can tell they're behind) — and tag the
  commit (`git tag v0.1.0`).
- Never rename the plugin `name` slug once published — it breaks everyone's install.
- Plugin names must be kebab-case (lowercase, digits, hyphens) or the claude.ai sync
  rejects them. Ours (`kanban`) is fine.

## Channel 2 — submit to the official plugin directory

Anthropic runs [`anthropics/claude-plugins-official`](https://github.com/anthropics/claude-plugins-official),
which ships in every Claude Code install. Third parties can submit through their plugin
directory submission form; plugins must meet quality and security review.

- [ ] Read the contribution / submission guidelines on that repo.
- [ ] Submit `dist0com/kanban-skill` via the form.
- [ ] Address review feedback.

## Channel 3 — third-party directories (index public repos)

These sync from GitHub automatically or take a submission. Getting listed is mostly about
having a clean public repo with a good README and the manifests above.

| Directory | URL | How to get listed |
| --- | --- | --- |
| skills.sh (Vercel Agent Skills) | https://skills.sh | Auto-indexes public repos with a `SKILL.md` or `.claude-plugin/marketplace.json`. Install: `npx skills add dist0com/kanban-skill`. Submission rules: https://skills.sh/docs |
| Claude Marketplaces | https://claudemarketplaces.com | Indexes public repos daily; submit if not auto-picked |
| LobeHub Skills | https://lobehub.com/skills | Submission / sync from GitHub |
| SkillsMP | https://skillsmp.com | Submission / sync from GitHub |
| MCP Market (Skills) | https://mcpmarket.com/tools/skills | Submission / sync from GitHub |
| agentskill.club | https://www.agentskill.club | Submission / sync from GitHub |
| Claude Plugin Hub | https://www.claudepluginhub.com | Indexes marketplaces |
| awesome-claude-skills lists | (various GitHub lists) | Open a PR adding this repo |

Checklist for each:

- [ ] Confirm the repo is public with a clear README and LICENSE.
- [ ] Submit or PR the repo link with the short description from `plugin.json`.
- [ ] Record where it's listed so we can keep them updated on new versions.

## Channel 4 — the open standard

[agentskills.io](https://agentskills.io) hosts the portable `SKILL.md` standard used
across Claude Code, Cursor, Copilot, Codex, Gemini CLI, and more. Our `SKILL.md` already
follows it (name + description frontmatter), so the skill is portable beyond Claude Code.

## Channel 5 — the board UI on npm

The optional local board UI ships as its own npm package, **`kanban-skill-ui`**, so anyone
with a `docs/kanban/` board runs it with one command — `npx kanban-skill-ui` — instead of
copying the source. It's a Next.js app built with `output: 'standalone'`, so the published
tarball is a prebuilt server (nothing compiles on the user's machine).

How it's wired (in `kanban-ui/`):

- `next.config.mjs` sets `output: 'standalone'`.
- `bin/kanban-ui.mjs` is the `npx` entry — it boots `.next/standalone/server.js`, reads the
  board via `KANBAN_BOARD_DIR` / `--board`, and serves `localhost:7420` by default.
- `package.json` has `prepublishOnly: build:standalone` (builds + copies static assets into
  the standalone dir), a `files` whitelist (`bin/`, `.next/standalone/`), and `bin`.
- The agent connector config is **not** in the package — it lives in the consumer repo at
  `docs/kanban/ui.config.json`, so `npx` always serves the latest UI and user config is safe.

To publish a new version:

```
cd kanban-ui
# bump "version" in package.json
npm publish        # prepublishOnly builds the standalone server first
```

Then smoke-test from any repo that has a board: `npx kanban-skill-ui`. First publish is
public and unscoped; the name `kanban-skill-ui` must never be renamed once live (breaks
everyone's `npx`).

## A website (optional)

Decide per task #2 on the board. Options, cheapest first:

1. **Just the README** — GitHub renders it; often enough for a dev tool.
2. **A page under an existing domain** — e.g. `dist0.com/kanban` (the skill's origin).
   Cheap, borrows existing traffic; a name mismatch is fine.
3. **A standalone domain + static landing page** — most work; only worth it if the skill
   gets real traction.

Whatever the choice, the landing content is the README's pitch plus the two install paths.

## Release checklist

1. `claude plugin validate .` passes.
2. Version bumped in `plugin.json`, `marketplace.json`, **and** `SKILL_VERSION` in
   `skill/kanban.mjs`; commit tagged.
3. README and guides reflect any behavior change.
4. If the board UI changed, bump `kanban-ui/package.json` version and `npm publish` it
   (Channel 5); smoke-test `npx kanban-skill-ui`.
5. Push to `main`; directories that auto-sync pick it up. Ping the ones that don't.

# Publish as an installable plugin + submit to the official directory

**Track:** distribution · **Priority:** high · **ROI:** high
**Blocked by:** none · **Related:** #2

Make the skill installable with one command and get it into the widest-reach channels:
Anthropic's official plugin directory and skills.sh (Vercel's Agent Skills Directory).

## Scope
- Confirm the repo works as a plugin marketplace: `claude plugin validate .` passes and a
  fresh project can `/plugin marketplace add` + `/plugin install` it.
- Submit the repo to `anthropics/claude-plugins-official` via their submission form.
- Get listed on skills.sh — it auto-indexes public repos that carry a `SKILL.md` or a
  `.claude-plugin/marketplace.json`, both of which we already have. Install is
  `npx skills add dist0com/kanban`.

## Todo
- [x] Run `claude plugin validate .` and fix anything it flags. — passes, including `--strict`.
- [x] Test `/plugin marketplace add dist0com/kanban` then `/plugin install kanban@kanban` in a scratch project. — verified via the `claude plugin` CLI against the **public GitHub repo** (add marketplace → clone → validate → install → skill loads → cleaned up).
- [ ] Read the official directory's contribution rules and submit the repo. — rules read: submit via the form at https://clau.de/plugin-directory-submission; plugins pass a quality/security review. **Owner action:** repo is now public; owner submits the form (text prepared in "## Submission text" below).
- [ ] Confirm skills.sh picks up the repo (search it, or run `npx skills add dist0com/kanban`). Repo is public now, so it's eligible; skills.sh crawls on its own cadence — check the listing in a few days.
- [x] Add the install commands and the live listing links (official directory + skills.sh) to the README. — plugin + `npx skills add` install commands added; live listing links deferred until the repo is listed.

## Done so far
Repo `dist0com/kanban` is **public**; code pushed to `main`; plugin validates (incl.
`--strict`) and installs cleanly from GitHub. Two open todos remain: the owner submits the
official-directory form, and we wait for skills.sh to index the repo.

## Submission text
For the official directory form (https://clau.de/plugin-directory-submission):
- **Repo:** https://github.com/dist0com/kanban
- **Plugin name (slug):** kanban
- **Category:** productivity
- **Description:** A file-based task board Claude runs for you: propose work, add clear
  cards, dive deeper, finish or reject. Backlog is plain Markdown in docs/kanban/.
- **License:** Apache-2.0

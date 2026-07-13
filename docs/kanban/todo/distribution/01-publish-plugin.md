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
- [x] Test `/plugin marketplace add dist0com/kanban` then `/plugin install kanban@kanban` in a scratch project. — verified locally via the `claude plugin` CLI (add marketplace → install → skill loads → cleaned up).
- [ ] Read the official directory's contribution rules and submit the repo. — rules read: submit via the form at https://clau.de/plugin-directory-submission; plugins pass a quality/security review. **Blocked:** repo is private; the form and review need a public repo, and submission is the owner's action.
- [ ] Confirm skills.sh picks up the repo (search it, or run `npx skills add dist0com/kanban`). **Blocked:** skills.sh only auto-indexes *public* repos.
- [x] Add the install commands and the live listing links (official directory + skills.sh) to the README. — plugin + `npx skills add` install commands added; live listing links deferred until the repo is public and listed.

## Blocker
The repo `dist0com/kanban` is **private**. Both directory submissions (official directory
and skills.sh) require a public repo, and submitting to the official directory is an
owner-account action. Make the repo public, then the two open todos can proceed.

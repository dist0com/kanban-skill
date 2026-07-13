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
- [ ] Run `claude plugin validate .` and fix anything it flags.
- [ ] Test `/plugin marketplace add dist0com/kanban` then `/plugin install kanban@kanban` in a scratch project.
- [ ] Read the official directory's contribution rules and submit the repo.
- [ ] Confirm skills.sh picks up the repo (search it, or run `npx skills add dist0com/kanban`); check the submission rules at https://skills.sh/docs if it doesn't auto-list.
- [ ] Add the install commands and the live listing links (official directory + skills.sh) to the README.

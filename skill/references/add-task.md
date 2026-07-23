# Write a card's body

The script has already scaffolded the card you were given — its frontmatter, a body
template, and its README entry exist. Your job is the **body** only: the summary line,
`## Scope`, and `## Todo`. Replace the template placeholders with Write/Edit.

**Never touch the frontmatter.** The script owns it — a wrong meta field is fixed with
`create`/`update` (see "The script" in `SKILL.md`), not with an editor.

Before writing, read `docs/kanban/redesign.md` and follow the design it tells you to
use for this area — don't repeat a mistake it warns against.

## Card shape

A rough shape, not a strict form. Keep lines short and plain — a non-native reader
skimming should get each line in one pass. Add any section that helps; drop any that
doesn't.

```
---
title: <one line>
track: <one of your tracks>
priority: <high|med|low>
roi: <high|med|low>
blocked_by: [<id>, <id>]   # [] for none
related: [<id>, <id>]      # [] for none
questions: []              # questions a human must decide; [] for none
---

<one short line: what to do and why it matters.>

## Scope
- <the concrete steps>

## Todo
- [ ] <one step you can check off>
- [ ] <…>
```

- **title** lives in the frontmatter — one source of truth, so no `#` H1 in the body.
- **blocked_by / related / questions** are set through the script's flags (see
  "Relationships"); they belong to whoever runs `create`/`update`, not to the body.

**Todo** — split the scope into steps you can check off, in the order you'd do them.
Each one is a single line.

**Pushback** — add a `## Pushback` section only if something feels off: too much work
for the value, not worth doing now, or a risk to users. Skip it otherwise.

Add other sections freely when they help — open questions, links, examples, whatever.
This isn't a full plan, just enough to start.

## Don't split off near-duplicates

For whoever decides a card should exist, not the body writer. Before adding a card,
check it against the task it builds on. If the new card is mostly a tweak, reframe, or
extra detail on an upstream card that **isn't built yet**, don't make a new card —
update the upstream card instead. A card earns its own id only when it's genuinely
separate work (a different file, system, or deliverable), not a minor modification
layered on top of another open task.

## Document a change

If the card ships something a user can see, it carries todos to update the docs it
touches, so the change isn't hidden after it ships. Follow `references/document-feature.md`.

## Relationships

Tasks connect to each other. Every card lists two kinds of connected tasks in its
frontmatter, by id — set with `create`/`update`'s `--blocked-by` and `--related` flags:

- **Blocked by** — tasks that must finish first. This one can't start, or can't be done
  right, until they're done. A card with an open blocker isn't ready to pick; say what
  blocks it when proposing what's next.
- **Related** — tasks about the same feature, page, or data. They don't block this one,
  but keep them in sync so they don't drift apart or repeat each other.

# Resolve open questions

A card whose `questions` frontmatter is not empty is waiting on decisions. Resolving
them is the only way to move it forward — a nudge is blocked until the list is empty
(see `references/nudge.md`).

Work through the questions one at a time:

1. **Research before deciding.** Read the code, the board, `archive.md`,
   `rejected.md`, `redesign.md`, and your reference docs. Many questions dissolve
   once you look — the answer is already written down, already shipped, or already
   rejected.
2. **Form options.** Lay out 2–3 realistic answers with their trade-offs, and pick a
   recommendation.
3. **Decide yourself when the evidence settles it.** If one option is plainly right —
   the codebase forces it, a past decision covers it, the alternatives break a rule
   in `redesign.md` — take it, and note the decision and the reason in the card body.
4. **Ask the user when it's a judgment call.** Taste, priorities, money, product
   direction — present the options and your recommendation, then wait for the
   answer. Never guess on these.
5. **Write the answers back.** Fold each answer into the card body (scope, todos, or
   a short `## Decisions` note), then update the frontmatter:
   - all answered → `node .claude/skills/kanban/kanban.mjs update <id> --clear-questions`
   - some remain → `update <id> --question "..."` listing only the unanswered ones
     (the flag replaces the whole list).

A card with an emptied `questions` list is nudgeable again. Nudge it next — a nudge
is what can mark the card `ready` once the plan is concrete.

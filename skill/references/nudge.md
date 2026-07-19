# Nudge

Take one task and move it one step forward — from vague to concrete. A nudge is two
substeps, always in order: **review** the card, then **rewrite** it.

**Gate: open questions block a nudge.** If the card's `questions` frontmatter is not
empty, the card is waiting on decisions — don't nudge it. Resolve the questions first
(`references/resolve.md`), then nudge once the list is empty.

## 1. Review

Read the card and check it on four points. Don't overthink — flag real problems, not
hypotheticals.

1. **Missing steps.** Work the plan implies but never lists: a docs update, tests, a
   human review pass, a landing-copy update, and the like.
2. **Missed edge cases and unreliable designs.** Call out design mistakes the card
   glosses over. Example: a task-management backend designed to keep tasks only in
   memory loses everything on restart — that's a mistake to point out, not a detail.
   Also check decisions the card already states. A written decision can still be
   wrong — don't skip it just because it looks settled.
3. **Over-complication.** Is the design more machinery than the value justifies? Name
   what to cut.
4. **Actionability.** Is the card still a rough idea nobody could start on?

The review's outcome is two lists:

- **Open questions** — decisions that are hard to make without the user: taste,
  priorities, money, product direction. Record them on the card with
  `node .claude/skills/kanban/kanban.mjs update <id> --question "..."` (repeat the
  flag for several).
- **Revisions** — fixes you can decide yourself. Carry them into the rewrite.

## 2. Rewrite

1. **Push the card one stage forward.** Judge where it stands, then take the next
   step only — one stage, not three:
   - **A rough idea** → work out if it's worth doing and how. The user value, who
     it's for, whether we can build it. Land on a clearer shape.
   - **A decided-on feature** → design the exact user experience. What the user sees,
     each step they take, what happens on edge cases.
   - **A research or content task** → find the specific question to answer or the
     piece's structure, and what we can say that others don't.

   These are examples, not a fixed list. Read the task and decide what "one step
   forward" means for it.
2. **Apply the revisions** from the review.
3. **Split off side ideas.** An idea that came up during the nudge but isn't part of
   this task becomes its own card (follow `references/add-task.md`, including its rule
   against near-duplicate splits) — not a bullet buried in this one.
4. **Write the result back into the card body.** Use plain, short, clear language, the
   way `references/add-task.md` writes a card: short lines, plain words, no jargon. A
   reader should get each line at a glance.

**Stop at the code level.** Never push further once the plan is concrete. Don't
mention coding details — what functions to add, what files to touch. Stop when the
whole plan is easy to start.

If the review raised open questions, still rewrite with what you could decide, but
leave the questions on the card — the next nudge is blocked until they're resolved.

## Group tasks

A **group task** is a root card plus its subtask cards in one folder (see "Group task"
in `SKILL.md`). Root and subtasks are one plan split across files, so nudging the
`root.md` ripples into them.

After you rewrite the root, bring its subtasks in line with the new plan:

- Re-read each subtask card. Nudge the ones the change touched so their scope, order,
  and blocked-by links still match the root.
- Drop a subtask the plan no longer needs (reject it); add a card for a new piece it
  now needs (`references/add-task.md`).
- Keep the root's subtask list and the real subtask cards in sync.

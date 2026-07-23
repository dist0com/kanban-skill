# Review a task

reviews one or multiple kanban tasks.
when you are reviewing multiple tasks, spawn one subagent per kanban task in parallel.
review each for the following criteria:

1. ensure the task is written in the plain language that `references/add-task.md` instructs.
2. ensure the task is splitted into todos.
3. ensure relevant tasks are grouped.
4. archive the task if all todos are done and the main task goal is done.
5. check todo statuses in the task. if all todos are done, archive it.
6. ensure the task has a business necessity. think from the user perspective.
   if the task doesn't bring value or it's covered by other tasks, reject it.
   ask me questions if you can't decide.
7. ensure feasibility of the task.
   don't include unclear, abstract, infeasible goals.
   propose options to accomplish the task, if it's untrivial.
   auto-recommend the best option if there are multiple.
8. ensure the task plan is unambiguous.
   it doesn't need to have code-level details. but the requirements should be clear.
9. propose tasks if you notice things not covered in our existing todos or relevant tasks.
   ask me questions if you can't decide whether the proposed tasks should be included.
10. check if the task is not already done by the shipped product. confirm before
    keeping the task: a code change → search the codebase; a doc / content change →
    search where that content lives (your reference docs in the skill's Configuration);
    a research task → check where past research is written up. if it's
    already covered, reject it.
    - example: a card "end every page with a clear next step" when a shared footer already
      renders that next step on every page — the card would duplicate what ships. rejected.
11. if the card ships something a user can see, ensure it carries doc-update todos so the
    change won't be hidden after it ships. Check it against
    `references/document-feature.md`.
    - If a user-visible card touches none of your documented surfaces, it must say why.

## feature value

use this when a task proposes building a new feature, to decide whether it earns a
place on the board. run the tests in order. if it fails the use-case test, don't add it.

1. use-case test. list every concrete thing a user would use the feature for. for each
   use case, check whether it already collapses into one of:
   - an existing feature or signal,
   - a filtering or configuration knob we already have,
   - a different product we deliberately don't compete on.
   if every strong use case collapses, there is no distinct use case. stop and reject.

2. design-principle test. check the feature against your project's design principles
   (your roadmap doc, if you keep one). reject one that contradicts a core principle.

3. duplication test. search the board for a card that already owns the idea. if one
   exists, update that card instead of adding a new one.

4. evidence test (optional). is the feature ahead of what you've confirmed users want?
   if a smaller version could test the idea first, do that first.

add the feature only if it passes the use-case, design-principle, and duplication tests.

> Some projects add stricter gates — a moat test, a trust test, a market-validation
> step. Those live in a preset (e.g. `references/presets/indie-hacker.md`); load the
> preset your project uses and apply its extra tests here.

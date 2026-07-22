---
title: "Explore what the memory layer should hold"
track: skill
priority: med
roi: high
blocked_by: []
related: [31, 33]
questions: []
---

Research task. Figure out what facts an agent needs on hand to propose good tasks,
and how the propose flow should read them. The module map (#33) is the first fact;
this task finds the rest.

## Scope
- Look at past propose runs: what did the agent have to re-discover or guess each
  time? Each of those is a candidate for memory.
- Candidate facts to weigh: project goals, target users, module map, code
  conventions, what shipped recently, known constraints.
- For each fact worth keeping, decide: where it lives, who writes it, and when it
  gets refreshed.
- Decide how the propose flow reads memory — loaded every scan, or only for the
  chosen focus area.
- Each confirmed piece becomes its own subtask in this group. This card only
  decides; it doesn't build.

## Todo
- [ ] List what past propose runs had to guess or re-discover
- [ ] Pick which facts earn a place in memory, and why
- [ ] Decide the file layout and who writes each file
- [ ] Decide how the propose flow reads memory
- [ ] Write each confirmed piece as a new subtask in this group

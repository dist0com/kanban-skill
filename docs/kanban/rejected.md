# Rejected

Ideas we turned down, grouped by topic. One line each: the idea, and why we said no. Read
before proposing so you don't re-suggest them.

## Storage

- **Database-backed board** — the whole point is plain files in git that Claude and a
  human can both read and diff. A database hides the board and adds a dependency.

## Local UI

- **Human-in-the-loop / mid-run reply to the agent** — we don't add a live reply channel.
  The agent raises "open questions" on the card and the user answers those. Watching a run
  is a read-only tail of its log (that part lives on as its own task).

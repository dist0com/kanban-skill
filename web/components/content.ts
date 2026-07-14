export const GITHUB_URL = "https://github.com/dist0com/kanban";

export const features: { title: string; body: string }[] = [
  {
    title: "Plain Markdown, in your repo",
    body: "Every card is a Markdown file under docs/kanban/. Diffable, reviewable, versioned with your code — not locked in a SaaS.",
  },
  {
    title: "Steered in plain language",
    body: 'Say "what\'s next?" or "#4 is done." Claude reads the board and your sources, then proposes, writes, and archives for you.',
  },
  {
    title: "No database, no MCP",
    body: "One SKILL.md and a dependency-free Node script. The script is the only thing that allocates ids or touches metrics.",
  },
  {
    title: "Built for solo founders",
    body: "Keep marketing, building, docs, and research side by side in one repo — so the model can compose across everything you have.",
  },
];

export const boardRows: { say: string; does: string }[] = [
  { say: '"what\'s next?"', does: "reads the board + your sources, proposes 3 new tasks" },
  { say: '"add a task: …"', does: "reviews the idea, writes a card, adds it to the index" },
  { say: '"dive deeper on #4"', does: "pushes card #4 one stage toward concrete" },
  { say: '"review the board"', does: "checks cards for clarity, duplication, done-ness" },
  { say: '"#4 is done"', does: "compresses it into the archive, removes the card" },
];

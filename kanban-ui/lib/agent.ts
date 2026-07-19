import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./paths";
import type { AgentAction } from "./types";

// --- the one place the agent command is configured --------------------------
// Reads kanban-ui/agent.config.json ({"command": "claude -p"}); falls back to a
// plain `claude -p`. The command is split into argv on spaces (the default has
// no quoted args) and spawned WITHOUT a shell — the prompt is always a separate
// argv entry, so it never needs escaping and can't be shell-injected.
function agentArgv(): string[] {
  const configFile = path.join(process.cwd(), "agent.config.json");
  let command = "claude -p";
  try {
    if (fs.existsSync(configFile)) {
      const cfg = JSON.parse(fs.readFileSync(configFile, "utf8"));
      if (typeof cfg.command === "string" && cfg.command.trim()) {
        command = cfg.command.trim();
      }
    }
  } catch {
    // keep the default on any parse error
  }
  return command.split(/\s+/).filter(Boolean);
}

// --- prompts: one place that turns a card action into agent instructions ----
// Every prompt tells the agent to use this repo's kanban skill. The skill's
// script lives behind a symlink, so id-touching moves (create/archive/reject)
// must run it with `node --preserve-symlinks-main .claude/skills/kanban/kanban.mjs`.
const SCRIPT = "node --preserve-symlinks-main .claude/skills/kanban/kanban.mjs";

export interface AgentRequest {
  action: AgentAction;
  id?: number;
  title?: string;
  notes?: string; // implement
  reason?: string; // reject
  description?: string; // create
}

export function buildPrompt(req: AgentRequest): string {
  const tag = req.id ? `#${req.id}` : "";
  const named = req.title ? `${tag} ("${req.title}")` : tag;
  switch (req.action) {
    case "implement":
      return [
        `Use the kanban skill in this repo. Implement task ${named}.`,
        `Read its card, do the work it describes, and check off its todos as you finish each one.`,
        req.notes ? `Extra notes from the user: ${req.notes}` : "",
        `Do not archive or move the card — only implement and tick the todos.`,
      ]
        .filter(Boolean)
        .join(" ");
    case "review":
      return [
        `Use the kanban skill in this repo. Review whether task ${named} is really done.`,
        `Check the work against the card. If anything is missing or a decision is still owed by the user,`,
        `record those as open questions in the card's \`questions\` metadata with`,
        `\`${SCRIPT} update ${req.id} --question "..."\` (repeatable).`,
        `Do not mark the task done and do not implement — only review and raise questions.`,
      ].join(" ");
    case "reject":
      return [
        `Use the kanban skill in this repo. Reject task ${named}.`,
        `Reason: ${req.reason || "(none given)"}.`,
        `Follow the skill's reject flow: add a one-line entry (the idea + why) under the right topic in`,
        `docs/kanban/rejected.md, then remove the card with \`${SCRIPT} reject ${req.id}\`.`,
      ].join(" ");
    case "archive":
      return [
        `Use the kanban skill in this repo. Finish task ${named} — all its todos are done.`,
        `Follow the skill's finish flow: write the 1-2 line "what you can now do" note under the right topic in`,
        `docs/kanban/archive.md, then remove the card with \`${SCRIPT} archive ${req.id}\`.`,
      ].join(" ");
    case "create":
      return [
        `Use the kanban skill in this repo to add new task(s) from this requirement:`,
        `"${req.description || ""}".`,
        `Follow the skill's add-task flow — read the board first so you don't duplicate work, then scaffold the`,
        `card(s) with \`${SCRIPT} create --title "..." --track <track> ...\` and fill each body.`,
        `One requirement may become several cards.`,
      ].join(" ");
  }
}

export interface AgentResult {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

// Fire the agent in the repo root and wait for it to finish. No streaming and no
// human-in-the-loop in this version (that's task #9) — the UI shows a plain
// "running" state and refreshes the board when this resolves.
export function runAgent(prompt: string): Promise<AgentResult> {
  const argv = agentArgv();
  const [cmd, ...args] = argv;
  return new Promise((resolve) => {
    const child = spawn(cmd, [...args, prompt], {
      cwd: repoRoot(),
      env: process.env,
      shell: false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    child.on("error", (err) => {
      resolve({ ok: false, code: null, stdout, stderr: stderr + String(err) });
    });
    child.on("close", (code) => {
      // keep the response light — the last chunk is enough to show an outcome
      resolve({
        ok: code === 0,
        code,
        stdout: stdout.slice(-4000),
        stderr: stderr.slice(-2000),
      });
    });
  });
}

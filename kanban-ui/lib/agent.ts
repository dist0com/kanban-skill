import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./paths";
import type { AgentAction, AgentInfo } from "./types";

// --- the one place the agent command is configured --------------------------
// Reads the consumer repo's docs/kanban/ui.config.json ({"command": "claude -p"});
// falls back to a plain `claude -p`. Config lives in the project (not next to the
// UI source) so it survives an npx run, where the package itself sits in the npm
// cache. The command is split into argv on spaces (the default has no quoted
// args) and spawned WITHOUT a shell — the prompt is always a separate argv entry,
// so it never needs escaping and can't be shell-injected.
function resolveCommand(): { command: string; isDefault: boolean } {
  const configFile = path.join(repoRoot(), "docs", "kanban", "ui.config.json");
  try {
    if (fs.existsSync(configFile)) {
      const cfg = JSON.parse(fs.readFileSync(configFile, "utf8"));
      if (typeof cfg.command === "string" && cfg.command.trim()) {
        return { command: cfg.command.trim(), isDefault: false };
      }
    }
  } catch {
    // keep the default on any parse error
  }
  return { command: "claude -p", isDefault: true };
}

function agentArgv(): string[] {
  return resolveCommand().command.split(/\s+/).filter(Boolean);
}

// What the UI shows for "which agent runs the work". We only support a Claude
// Code subscription today, so the name is friendly when the command is `claude`
// and otherwise just echoes the configured binary.
export function agentInfo(): AgentInfo {
  const { command, isDefault } = resolveCommand();
  const bin = command.split(/\s+/)[0] || "claude";
  const name = /(^|\/)claude$/.test(bin) ? "Claude Code" : bin;
  return { name, command, isDefault };
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
  notes?: string; // implement, edit
  reason?: string; // reject
  description?: string; // create
}

export function buildPrompt(req: AgentRequest): string {
  const tag = req.id ? `#${req.id}` : "";
  const named = req.title ? `${tag} ("${req.title}")` : tag;
  switch (req.action) {
    case "implement":
      return [
        `/kanban. Implement task ${req.id} ${named}.`,
        req.notes ? `Extra notes: ${req.notes}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "review":
      // The skill's own "Review a task" flow archives/rejects and checks card
      // quality — the opposite of the UI's review. So keep these guardrails.
      return [
        `/kanban. Review task ${req.id} ${named}: judge whether the work is really done against the card.`,
        `Record anything missing or any decision the user still owes as open questions with`,
        `\`${SCRIPT} update ${req.id} --question "..."\` (repeatable).`,
        `Only review and raise questions — don't mark it done, and don't implement, archive, or reject it.`,
      ].join(" ");
    case "reject":
      return [
        `/kanban. Reject task ${req.id} ${named}. Reason: ${req.reason || "(none given)"}.`,
        `Follow the skill's reject flow.`,
      ].join(" ");
    case "archive":
      return [
        `/kanban. Archive task ${req.id} ${named}.`,
        `Follow the skill's archive flow.`,
      ].join(" ");
    case "edit":
      return [
        `/kanban. Revise task ${req.id} ${named}: "${req.notes || ""}".`,
        `Only revise the card — don't implement it, and don't move, archive, or reject it.`,
      ].join(" ");
    case "create":
      return [
        `/kanban. Add task(s) from this requirement: "${req.description || ""}".`,
        `Follow the skill's add-task flow.`,
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

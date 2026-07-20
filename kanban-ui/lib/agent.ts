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

// The command split into argv (binary + fixed args), ready for spawn. The
// registry appends the prompt as a final argv entry. Exported so the registry
// (which owns the running of agents now) shares this one resolution.
//
// `claude -p` in its default text mode prints nothing until the run ends, so a
// live tail would stay empty for the whole run. Ask claude to stream NDJSON
// events instead (lib/stream.ts renders them into log lines). Only for a
// claude binary, and never overriding an output format the user configured.
export function agentArgv(): string[] {
  const argv = resolveCommand().command.split(/\s+/).filter(Boolean);
  if (/(^|\/)claude$/.test(argv[0] ?? "") && !argv.includes("--output-format")) {
    argv.push("--output-format", "stream-json", "--verbose");
  }
  return argv;
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
  notes?: string; // implement, edit, nudge, resolve, archive
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
    case "reject":
      return [
        `/kanban. Reject task ${req.id} ${named}. Reason: ${req.reason || "(none given)"}.`,
        `Follow the skill's reject flow.`,
      ].join(" ");
    case "archive":
      return [
        `/kanban. Archive task ${req.id} ${named}.`,
        `Follow the skill's archive flow.`,
        req.notes ? `Extra notes: ${req.notes}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "edit":
      return [
        `/kanban. Revise task ${req.id} ${named}: "${req.notes || ""}".`,
        `Only revise the card — don't implement it, and don't move, archive, or reject it.`,
      ].join(" ");
    case "create":
      return [
        `/kanban. Add task(s) from this requirement: "${req.description || ""}".`,
        `Follow the skill's add-task flow. Create task only, don't implement it.`,
      ].join(" ");
    case "nudge":
      return [
        `/kanban. Nudge task ${req.id} ${named}: move it one step forward following \`references/nudge.md\`.`,
        `Review the card, then rewrite it one stage only — apply the fixes you can decide,`,
        `record decisions you still owe the user as open questions with`,
        `\`${SCRIPT} update ${req.id} --question "..."\` (repeatable), and stop at the code level.`,
        `If the plan is now concrete and no questions are open, mark it ready with`,
        `\`${SCRIPT} update ${req.id} --status ready\`.`,
        `Don't implement, archive, or reject it.`,
        req.notes ? `Extra notes: ${req.notes}` : "",
      ]
        .filter(Boolean)
        .join(" ");
    case "resolve":
      return [
        `/kanban. Resolve the open questions on task ${req.id} ${named} following \`references/resolve.md\`.`,
        `Research each question, decide it yourself when the evidence settles it and note the`,
        `decision in the card body. Leave anything that's a real judgment call as an open`,
        `question — the user answers it later, there's no mid-run reply. Clear answered ones with`,
        `\`${SCRIPT} update ${req.id} --clear-questions\` (or re-list only the unanswered with --question).`,
        `Don't implement, archive, or reject it.`,
        req.notes ? `Extra notes: ${req.notes}` : "",
      ]
        .filter(Boolean)
        .join(" ");
  }
}

// The agent no longer runs here. `lib/registry.ts` owns spawning: it starts the
// child, records the run in a shared registry, returns at once, and the UI polls
// the registry for the outcome. See startRun() there.

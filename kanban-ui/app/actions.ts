"use server";

// Server Actions — this is a local server, so the client calls these directly
// instead of going through HTTP API routes. Reads the board, fires an agent, and
// applies direct edits, all against the markdown files in docs/kanban/.

import { buildPrompt, type AgentRequest } from "@/lib/agent";
import { readBoard } from "@/lib/board";
import { patchCard, type CardPatch } from "@/lib/edit";
import { getRun, listRuns, startRun, type StartResult } from "@/lib/registry";
import type { Board, RunView } from "@/lib/types";

export async function getBoard(): Promise<Board> {
  return readBoard();
}

const ACTIONS = new Set(["implement", "reject", "archive", "edit", "create", "nudge", "resolve"]);

// Start an agent and return immediately with a runId (or a lock message). The
// request never waits for the child — the client polls listRunsAction() to see
// the run's progress and outcome.
export async function startAgentAction(req: AgentRequest): Promise<StartResult> {
  if (!req || !ACTIONS.has(req.action)) throw new Error("unknown action");
  if (req.action !== "create" && !Number.isInteger(req.id)) {
    throw new Error("action needs a card id");
  }
  const prompt = buildPrompt(req);
  return startRun(req, prompt);
}

// The shared run registry, for the UI's poll. Every tab reads the same picture.
export async function listRunsAction(): Promise<RunView[]> {
  return listRuns();
}

// One run with its log tail, read from the log file. The UI polls this while a
// run is live to tail its output, and calls it once to open a finished run's log.
export async function getRunAction(runId: string): Promise<RunView | null> {
  if (typeof runId !== "string" || !runId) return null;
  return getRun(runId);
}

export async function patchCardAction(
  id: number,
  patch: CardPatch,
): Promise<{ ok: boolean; error?: string }> {
  return patchCard(id, patch);
}

"use server";

// Server Actions — this is a local server, so the client calls these directly
// instead of going through HTTP API routes. Reads the board, fires an agent, and
// applies direct edits, all against the markdown files in docs/kanban/.

import { buildPrompt, runAgent, type AgentRequest } from "@/lib/agent";
import { readBoard } from "@/lib/board";
import { patchCard, type CardPatch } from "@/lib/edit";
import type { AgentResult } from "@/lib/agent";
import type { Board } from "@/lib/types";

export async function getBoard(): Promise<Board> {
  return readBoard();
}

const ACTIONS = new Set(["implement", "review", "reject", "archive", "edit", "create"]);

export async function runAgentAction(
  req: AgentRequest,
): Promise<AgentResult & { prompt: string }> {
  if (!req || !ACTIONS.has(req.action)) throw new Error("unknown action");
  if (req.action !== "create" && !Number.isInteger(req.id)) {
    throw new Error("action needs a card id");
  }
  const prompt = buildPrompt(req);
  const result = await runAgent(prompt);
  return { prompt, ...result };
}

export async function patchCardAction(
  id: number,
  patch: CardPatch,
): Promise<{ ok: boolean; error?: string }> {
  return patchCard(id, patch);
}

"use client";

// The Create-task action, self-contained so the shared Header can show it on
// both the board and a card page. It owns its own run tracking: the button opens
// the create dialog, a "Creating task" badge shows while the run is live, and
// when the run finishes its log opens and the route refreshes so the new card
// appears on the board.

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { RunView } from "@/lib/types";
import { ActionDialog, type AgentReq, RunLogOverlay, RunningBadge } from "./agent-shared";
import { Button } from "./button";
import { useAgentRuns, useRunLog } from "./runs";

export function CreateTask() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [logRunId, setLogRunId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openLog = useRunLog(logRunId);

  // A create run this tab started finished — open its log and re-read the server
  // component so the new card shows up (on the board; harmless on a card page).
  const onFinish = useCallback(
    (run: RunView) => {
      setLogRunId(run.runId);
      router.refresh();
    },
    [router],
  );

  const { runs, start } = useAgentRuns(onFinish);
  const creating = runs.some((r) => r.status === "running" && r.action === "create");

  // Start a non-blocking run. A lock refusal ("one board change at a time") comes
  // back as an error message.
  const startRun = useCallback(
    async (req: AgentReq, label: string) => {
      setOpen(false);
      setLogRunId(null);
      const res = await start(req, label);
      if (!res.ok) setError(res.error || "could not start the agent");
    },
    [start],
  );

  return (
    <div className="relative flex items-center gap-3">
      {creating && <RunningBadge label="Creating task" />}
      <Button
        className="gap-1.5"
        disabled={creating}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        <FiPlus className="text-[16px]" aria-hidden />
        Create task
      </Button>

      {error && (
        <div
          className="absolute right-0 top-full z-30 mt-2 max-w-[300px] cursor-pointer nb-panel-sm p-2.5 text-[12px]"
          style={{ background: "var(--color-nb-peach-soft)" }}
          onClick={() => setError(null)}
        >
          {error}
        </div>
      )}

      {logRunId && <RunLogOverlay run={openLog} onClose={() => setLogRunId(null)} />}
      {open && (
        <ActionDialog dialog={{ kind: "create" }} onClose={() => setOpen(false)} onRun={startRun} />
      )}
    </div>
  );
}

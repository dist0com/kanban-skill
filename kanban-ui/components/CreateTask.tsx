"use client";

// The Create-task action, self-contained so the shared Header can show it on
// both the board and a card page. The button opens the create dialog; starting a
// run pops the header's global runs panel open on that new run so the agent is
// visibly working (a create takes a while — a silent button reads as "nothing
// happened"). When the run finishes it re-opens the panel on that run (so its
// result/errors are never lost) and re-reads the server component so the new card
// shows up on the board.
//
// A create touches no card, so it has no card page of its own — the runs panel is
// its only home for the log. That log entry point (the archive icon, the badge, a
// past-run's tail) now lives in the shared Runs component; this component just
// starts the run and hands it to the panel.

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { FiPlus } from "react-icons/fi";
import type { RunView } from "@/lib/types";
import { ActionDialog, type AgentReq } from "./agent-shared";
import { Button } from "./button";
import { runsPanel, useAgentRuns } from "./runs";

export function CreateTask() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A create run this tab started finished — re-open the runs panel on it so the
  // result/errors are never lost, and re-read the server component so the new
  // card shows up (on the board; harmless on a card page).
  const onFinish = useCallback(
    (run: RunView) => {
      runsPanel.open(run.runId);
      router.refresh();
    },
    [router],
  );

  const { runs, start } = useAgentRuns(onFinish);
  // A create is a single global action (the server refuses a second), so disable
  // the button while one is live.
  const creating = runs.some((r) => r.status === "running" && r.action === "create");

  // Start a non-blocking run. A lock refusal ("a task is already being created")
  // comes back as an error message.
  const startRun = useCallback(
    async (req: AgentReq, label: string) => {
      setOpen(false);
      const res = await start(req, label);
      if (!res.ok) {
        setError(res.error || "could not start the agent");
        return;
      }
      // Pop the runs panel open on the new run so it's visibly working from the
      // first frame — it tails live there until the agent finishes.
      if (res.runId) runsPanel.open(res.runId);
    },
    [start],
  );

  return (
    <div className="relative flex items-center gap-3">
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

      {open && (
        <ActionDialog dialog={{ kind: "create" }} onClose={() => setOpen(false)} onRun={startRun} />
      )}
    </div>
  );
}

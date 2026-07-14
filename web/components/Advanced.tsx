import { ladderSteps, learnItems, recurringExamples } from "./content";
import { LoopDiagram } from "./LoopDiagram";
import { SectionHeading } from "./SectionHeading";
import { ThroughputChart } from "./ThroughputChart";
import { panelStatic } from "./styles";

const GROUP_TREE = `todo/42-payments/
  root.md                  # the tracking task
  feature/43-checkout.md   # a subtask, its own card + id
  feature/44-refunds.md
  bug/45-webhook-retry.md`;

// Accent fill ramps left→right so the ladder reads as "less human each rung".
const rungFill = ["bg-elev", "bg-accent/25", "bg-accent/50"];

function Tree({ children }: { children: string }) {
  return (
    <pre className={`${panelStatic} mt-4 overflow-x-auto bg-code p-5`}>
      <code className="font-mono text-sm leading-7 text-ink">{children}</code>
    </pre>
  );
}

function SubHeading({ children }: { children: string }) {
  return (
    <h3 className="flex items-center gap-2.5 text-xl font-semibold">
      <span className="h-4 w-1 bg-accent/60" aria-hidden="true" />
      {children}
    </h3>
  );
}

export function Advanced() {
  return (
    <section id="deeper" className="mt-24 scroll-mt-20">
      <SectionHeading num="04" eyebrow="Features" title="More than a flat list" />
      <p className="text-ink">
        A flat to-do list forgets. This board repeats routine work, breaks big
        jobs into pieces, and remembers what&apos;s already done.
      </p>

      {/* Recurring tasks: run on a loop */}
      <div className="mt-12">
        <SubHeading>Jobs Claude runs on a loop</SubHeading>
        <p className="mt-2 text-muted">
          Some work is never one-and-done. Keep each as a card in{" "}
          <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
            docs/kanban/todo/recurring/
          </code>{" "}
          — a job that never gets archived — and let Claude Code&apos;s{" "}
          <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
            /loop
          </code>{" "}
          run it on the cadence you pick, like every morning.
        </p>

        {/* Concrete examples */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {recurringExamples.map((e) => (
            <div key={e.label} className={`${panelStatic} bg-code p-5`}>
              <h4 className="text-[0.95rem] font-semibold text-ink">{e.label}</h4>
              <p className="mt-1.5 text-sm text-muted">{e.body}</p>
            </div>
          ))}
        </div>

        {/* Automation ladder */}
        <p className="mt-6 text-muted">
          Not every job needs the same level of automation. A card can sit at
          any rung — from one you drive by hand, to one Claude handles for you,
          to a script that runs on its own:
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3">
          {ladderSteps.map((s, i) => (
            <div key={s.tag} className="flex items-center gap-2">
              <div
                className={`rounded-lg border-2 border-border px-4 py-3 shadow-[3px_3px_0_0_#010409] ${rungFill[i]}`}
              >
                <span className="font-mono text-sm font-semibold text-accent">
                  {s.tag}
                </span>
                <span className="ml-2 text-[0.95rem] text-ink">{s.label}</span>
              </div>
              {i < ladderSteps.length - 1 && (
                <span className="text-lg font-bold text-accent" aria-hidden="true">
                  →
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted">
          Push each job as far up as it earns — some stay hands-on, others run
          themselves.
        </p>
      </div>

      {/* Group / tracking task */}
      <div className="mt-12">
        <SubHeading>Big jobs broken into pieces you can finish</SubHeading>
        <p className="mt-2 text-muted">
          A task too big to start tends to just sit there. When one card
          can&apos;t hold it, it becomes a{" "}
          <span className="font-medium text-ink">group task</span> — its own folder
          with a tracking <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">root.md</code>{" "}
          and one card per piece. Each piece gets its own id and is wired with{" "}
          <span className="font-mono text-[0.9em] text-accent">Blocked by</span>{" "}
          and <span className="font-mono text-[0.9em] text-accent">Related</span> links,
          so you always know the next thing to pick up.
        </p>
        <Tree>{GROUP_TREE}</Tree>
      </div>

      {/* Learns over time */}
      <div className="mt-12">
        <SubHeading>The board learns over time</SubHeading>
        <p className="mt-2 text-muted">
          Working the board is a loop. Each round, Claude proposes new work by
          pulling from three sources, you make the call, and it folds the result
          into a memory hub — so the next round builds on the last instead of
          repeating it.
        </p>

        {/* The loop, drawn as a real circle — the three sources live inside it */}
        <LoopDiagram />

        {/* The hub that collects your feedback and its learnings */}
        <div className={`${panelStatic} mt-6 overflow-hidden bg-code`}>
          <div className="border-b-2 border-border px-5 py-2.5 font-mono text-sm text-muted">
            docs/kanban/ &mdash; the hub that holds your feedback
          </div>
          <div className="divide-y divide-border">
            {learnItems.map((l) => (
              <div key={l.file} className="px-5 py-4 sm:flex sm:gap-5">
                <code className="font-mono text-sm font-semibold text-accent sm:w-32 sm:shrink-0">
                  {l.file}
                </code>
                <p className="mt-1 text-[0.95rem] text-muted sm:mt-0">{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-12">
        <SubHeading>It tracks its own throughput</SubHeading>
        <p className="mt-2 text-muted">
          Your velocity lives in git, next to the work — so you can see the board
          picking up pace over time.
        </p>
        <ThroughputChart />
      </div>
    </section>
  );
}

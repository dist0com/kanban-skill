import { GITHUB_URL } from "./content";
import { Quickview } from "./Quickview";

export function Hero() {
  return (
    <>
      <section className="mt-12 text-center">
        <p className="mb-5 inline-block rounded-full bg-accent/10 px-3 py-1 text-[0.78rem] font-semibold uppercase tracking-wider text-accent">
          A Claude Code skill
        </p>
        <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
          Your task board in Markdown,
          <br />
          right next to your code.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Claude proposes the next work, writes the cards, and archives what&apos;s
          done. Your backlog lives as plain Markdown files in{" "}
          <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
            docs/kanban/
          </code>{" "}
          — in git, diffable, readable by you and the agent. No database, no web app,
          no MCP. Just talk to the board.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="#install"
            className="rounded-lg border-2 border-accent bg-accent px-6 py-3 font-semibold text-white no-underline shadow-[4px_4px_0_0_#1f6feb] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#1f6feb]"
          >
            Install in one prompt
          </a>
          <a
            href={GITHUB_URL}
            rel="noopener"
            className="rounded-lg border-2 border-border px-6 py-3 font-semibold text-ink no-underline shadow-[4px_4px_0_0_#010409] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[6px_6px_0_0_var(--color-accent)]"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="mt-16">
        <Quickview />
      </section>
    </>
  );
}

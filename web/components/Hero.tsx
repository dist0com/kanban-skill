import Image from "next/image";
import { GITHUB_URL } from "./content";

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
            className="rounded-xl bg-accent px-6 py-3 font-semibold text-white no-underline transition-transform hover:-translate-y-0.5"
          >
            Install in one prompt
          </a>
          <a
            href={GITHUB_URL}
            rel="noopener"
            className="rounded-xl border border-border px-6 py-3 font-semibold text-ink no-underline transition-colors hover:bg-elev"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="mt-16 text-center">
        <Image
          src="/assets/quickview.jpg"
          alt="The kanban task tree rendered in the terminal"
          width={1600}
          height={1000}
          priority
          className="mx-auto h-auto w-full max-w-2xl rounded-xl border border-border shadow-2xl"
        />
        <p className="mt-4 text-sm text-muted">
          The board, rendered in your terminal — the same files that live in git.
        </p>
      </section>
    </>
  );
}

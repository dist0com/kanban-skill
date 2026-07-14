import { CodeBlock } from "./CodeBlock";

export function Install() {
  return (
    <section id="install" className="mt-20 scroll-mt-20">
      <h2 className="mb-3 text-3xl font-bold tracking-tight">Install in one prompt</h2>
      <p className="text-muted">
        From your project root, tell Claude Code (or any agent that can run shell
        commands):
      </p>
      <CodeBlock>{`Set up the kanban skill for this project. Read
https://raw.githubusercontent.com/dist0com/kanban/main/INSTALL_PROMPT.txt
and follow it.`}</CodeBlock>
      <p className="text-muted">
        The agent copies the skill into{" "}
        <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
          .claude/skills/kanban/
        </code>
        , reads your codebase to fill in the configuration, scaffolds the board, and
        proposes your first three tasks.
      </p>

      <p className="mt-8 text-muted">Or add it from the plugin marketplace:</p>
      <CodeBlock>{`/plugin marketplace add dist0com/kanban
/plugin install kanban@kanban`}</CodeBlock>
    </section>
  );
}

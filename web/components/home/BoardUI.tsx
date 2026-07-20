import { uiActions } from "../content";
import { BoardShots } from "./BoardShots";
import { CodeBlock } from "../CodeBlock";
import { SectionHeading } from "../SectionHeading";
import { panelStatic } from "../styles";

// The optional local board. The Markdown files stay the source of truth; this is
// a window onto them that also turns each card's routine moves into an agent run,
// so you stop re-typing the same prompts into the chat.
export function BoardUI() {
  return (
    <section id="ui" className="mt-24 scroll-mt-20">
      <SectionHeading num="03" eyebrow="Board UI" title="A local board you can open in the browser" />
      <p className="text-ink">
        Prefer to look instead of ask? One command opens a board over the same
        Markdown files — read a task in full without hunting for its file in your
        IDE tree, and act on it with a click instead of re-typing the same prompt
        into the chat.
      </p>

      {/* Two views of the same board, stacked as a flip deck (click to swap). */}
      <div className="mt-8">
        <BoardShots />
      </div>

      {/* Install: it's optional and prompt-driven, like everything else here. */}
      <p className="mt-8 text-ink">
        It&apos;s optional — the install step ships nothing extra. When you want
        it, just ask Claude:
      </p>
      <CodeBlock>{`/kanban run the local board UI`}</CodeBlock>
      <p className="text-muted">
        Claude starts the prebuilt server for you — localhost only, nothing to
        compile.
      </p>

      {/* Card actions — kept compact; they're self-evident once you see the board. */}
      <div className={`${panelStatic} mt-6 bg-code px-5 py-4`}>
        <p className="text-sm text-muted">
          Each card&apos;s buttons hand a move to an agent, no chat needed:
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 text-[0.95rem] sm:grid-cols-2">
          {uiActions.map((a) => (
            <li key={a.label} className="flex gap-2">
              <span aria-hidden="true">{a.icon}</span>
              <span>
                <span className="font-semibold text-ink">{a.label}</span>{" "}
                <span className="text-muted">— {a.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

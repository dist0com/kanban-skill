import { GITHUB_URL } from "./content";

export function Header() {
  return (
    <header className="mx-auto flex max-w-4xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
      <a href="/" className="text-lg font-bold text-ink no-underline">
        🗂️ kanban <span className="font-normal text-muted">skill</span>
      </a>
      <nav className="flex gap-5 text-[0.95rem] text-muted">
        <a href="#install" className="transition-colors hover:text-ink">
          Install
        </a>
        <a href="#board" className="transition-colors hover:text-ink">
          Using it
        </a>
        <a
          href={GITHUB_URL}
          rel="noopener"
          className="transition-colors hover:text-ink"
        >
          GitHub ↗
        </a>
      </nav>
    </header>
  );
}

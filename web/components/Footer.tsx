import { GITHUB_URL } from "./content";

export function Footer() {
  return (
    <footer className="mx-auto mt-20 max-w-4xl border-t border-border px-6 pb-12 pt-8 text-center text-sm text-muted">
      <p>
        <a href={GITHUB_URL} rel="noopener" className="text-muted hover:text-ink">
          GitHub
        </a>{" "}
        · Apache License 2.0 · Generalized from a skill built for{" "}
        <a href="https://www.dist0.com/" rel="noopener" className="text-muted hover:text-ink">
          dist0
        </a>
      </p>
    </footer>
  );
}

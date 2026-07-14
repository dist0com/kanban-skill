"use client";

import { useState } from "react";

export function CodeBlock({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(children);
      } else {
        // fallback for non-secure contexts (e.g. plain http)
        const ta = document.createElement("textarea");
        ta.value = children;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } catch (err) {
      console.error("Copy failed", err);
    } finally {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="group relative my-4">
      <pre className="overflow-x-auto rounded-lg border-2 border-border bg-code p-5 pr-14 shadow-[4px_4px_0_0_#010409]">
        <code className="font-mono text-sm leading-7 text-ink">{children}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border-2 border-border bg-code px-2.5 py-1.5 text-xs font-medium text-muted opacity-0 transition-all duration-150 hover:border-accent/50 hover:text-ink focus-visible:opacity-100 focus-visible:outline-none active:scale-95 group-hover:opacity-100 cursor-pointer"
      >
        {copied ? (
          <>
            <CheckIcon />
            <span className="text-green-600 dark:text-green-500">Copied</span>
          </>
        ) : (
          <>
            <CopyIcon />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-600 dark:text-green-500"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

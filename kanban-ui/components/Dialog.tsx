"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A small modal on the neo-brutalism scrim. Esc closes; clicking the backdrop
// closes; the panel itself doesn't.
//
// The scrim is `position: fixed`, so it must render at the document root to
// cover the viewport. We portal it to <body>: a `backdrop-filter`/`transform`
// ancestor (e.g. the sticky, blurred header) would otherwise become the
// containing block for the fixed scrim and trap it inside that header's
// stacking context — the board would then paint over the modal.
export function Dialog({
  title,
  onClose,
  children,
  width = 520,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className="nb-scrim" style={{ alignItems: "center" }} onClick={onClose}>
      <div
        className="nb-panel flex flex-col"
        style={{ width, maxWidth: "100%", maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex shrink-0 items-center justify-between px-5 py-3"
          style={{ borderBottom: "1.5px solid var(--color-nb-ink)" }}
        >
          <h2 className="text-[15px] font-[800] tracking-[-0.02em]">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[18px] leading-none text-nb-ink-soft hover:text-nb-ink"
          >
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

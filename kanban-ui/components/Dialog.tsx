"use client";

import { useEffect } from "react";

// A small modal on the neo-brutalism scrim. Esc closes; clicking the backdrop
// closes; the panel itself doesn't.
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
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
    </div>
  );
}

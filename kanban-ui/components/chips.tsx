"use client";

import { FiChevronDown, FiFlag } from "react-icons/fi";

// Meaning-coded chips + level selects, all built from the design language's
// borderless pill and quiet select. Priority/roi map onto the signal pastels.

// One high/med/low scale shared by priority and roi. `dot` is the solid signal
// colour; `soft`/`ink` are the filled-chip pair.
const LEVEL: Record<string, { soft: string; ink: string; dot: string }> = {
  high: {
    soft: "var(--color-nb-peach-soft)",
    ink: "var(--color-nb-peach-ink)",
    dot: "var(--color-nb-peach)",
  },
  med: {
    soft: "var(--color-nb-sky-soft)",
    ink: "var(--color-nb-sky-ink)",
    dot: "var(--color-nb-sky)",
  },
  low: {
    soft: "var(--color-nb-wash)",
    ink: "var(--color-nb-ink-soft)",
    dot: "color-mix(in srgb, var(--color-nb-ink) 28%, transparent)",
  },
};

function Dot({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      style={{ display: "block", width: 6, height: 6, borderRadius: 999, flex: "0 0 auto", background: color }}
    />
  );
}

// Priority — the hero signal on a card. Filled chip carrying the level word
// itself (high/med/low); a flag marks it as priority so we never fall back to a
// cryptic "P" label.
export function PriorityChip({ value }: { value: string }) {
  const c = LEVEL[value] || LEVEL.low;
  return (
    <span className="nb-chip" style={{ background: c.soft, color: c.ink }}>
      <FiFlag aria-hidden style={{ width: 11, height: 11, flex: "0 0 auto" }} />
      {value}
    </span>
  );
}

// ROI — secondary. Dot + muted label, no fill, so it reads one rung below the
// priority chip instead of mirroring it as a second identical pill.
export function RoiTag({ value }: { value: string }) {
  const c = LEVEL[value] || LEVEL.low;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10.5px] font-[700] uppercase tracking-[0.04em] text-nb-ink-soft">
      <Dot color={c.dot} />
      ROI {value}
    </span>
  );
}

// Todo progress — a thin bar + count for the card's top meta row. Reads as
// status (empty → full, mint when complete) rather than yet another chip.
// `width` lets the card page draw a longer bar than the board's 32px sliver.
export function TodoProgress({ done, total, width = 32 }: { done: number; total: number; width?: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const complete = total > 0 && done >= total;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        style={{
          display: "block",
          width,
          height: 5,
          borderRadius: 999,
          overflow: "hidden",
          background: "color-mix(in srgb, var(--color-nb-ink) 12%, transparent)",
        }}
      >
        <span
          style={{
            display: "block",
            height: "100%",
            width: `${pct}%`,
            background: complete ? "var(--color-nb-mint)" : "var(--color-nb-accent)",
          }}
        />
      </span>
      <span className="text-[11px] font-[700] tabular-nums text-nb-ink-soft">
        {done}/{total}
      </span>
    </span>
  );
}

export function TrackChip({ track }: { track: string }) {
  const blocker = track === "blockers";
  return (
    <span
      className="nb-chip"
      style={{
        background: blocker
          ? "var(--color-nb-peach-soft)"
          : "var(--color-nb-lilac-soft)",
        color: blocker
          ? "var(--color-nb-peach-ink)"
          : "var(--color-nb-lilac-ink)",
      }}
    >
      {track}
    </span>
  );
}

// A quick-adjust level select for priority / roi. Looks like the other meaning
// chips — filled with the current level's signal colour — but is a native
// <select>, so it edits in place. The fixed option set means a bad value can't
// slip in.
export function LevelSelect({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled?: boolean;
  onChange: (v: string) => void;
}) {
  const c = LEVEL[value] || LEVEL.low;
  return (
    <span className="nb-levelselect" style={{ background: c.soft, color: c.ink }}>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => e.stopPropagation()}
      >
        <option value="high">high</option>
        <option value="med">med</option>
        <option value="low">low</option>
      </select>
      <FiChevronDown aria-hidden style={{ width: 10, height: 10 }} />
    </span>
  );
}

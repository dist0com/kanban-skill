import { soloTracks } from "../content";
import { SectionHeading } from "../SectionHeading";
import { panel } from "../styles";

// Each track's share, rendered as one segment of the proportion bar and as a
// matching swatch on its card — a distinct hue per track type so "these are
// different kinds of work" reads before the words do.
const trackColor: Record<string, { bar: string; text: string }> = {
  growth: { bar: "bg-growth", text: "text-growth" },
  validation: { bar: "bg-validation", text: "text-validation" },
  building: { bar: "bg-building", text: "text-building" },
};

export function Presets() {
  return (
    <section id="solo" className="mt-24 scroll-mt-20">
      <SectionHeading num="04" eyebrow="Presets" title="Built for solo founders" />
      <p className="text-ink">
        Building all day while nobody&apos;s watching is the classic solo-founder
        trap. This preset splits your time three ways — finding users, checking
        demand, and building — and Claude keeps new work spread across all three
        instead of piling it onto one.
      </p>

      {/* Proportion bar */}
      <div className="mt-8 flex h-4 w-full overflow-hidden rounded-md border-2 border-border">
        {soloTracks.map((t) => (
          <div
            key={t.name}
            className={trackColor[t.name].bar}
            style={{ width: t.weight }}
            title={`${t.name} ${t.weight}`}
          />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {soloTracks.map((t) => (
          <div key={t.name} className={`${panel} p-6`}>
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`h-3 w-3 rounded-sm ${trackColor[t.name].bar}`}
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <span
                className={`ml-auto font-mono text-sm font-semibold ${trackColor[t.name].text}`}
              >
                {t.weight}
              </span>
            </div>
            <p className="text-[0.95rem] text-muted">{t.body}</p>
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-muted">
        The <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">indie-hacker</code>{" "}
        preset also adds review gates — a moat test and a trust test — plus a
        market-validation method for posting to Reddit or X before you build. Swap in
        your own tracks and weights at install time.
      </p>
    </section>
  );
}

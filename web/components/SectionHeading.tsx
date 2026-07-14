// Numbered eyebrow + H2, with an accent marker block so sections are scannable
// at a glance and read as ordered chapters instead of one uniform wall.
export function SectionHeading({
  num,
  eyebrow,
  title,
}: {
  num: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-3">
        <span className="h-5 w-1.5 bg-accent" aria-hidden="true" />
        <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {num} · {eyebrow}
        </span>
      </div>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">{title}</h2>
    </div>
  );
}
